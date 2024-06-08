"use client";

import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import * as xrpl from "xrpl";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { ProgressBar } from "~~/components/scaffold-eth/ProgressBar";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const price = useNativeCurrencyPrice();
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  // const DynamicXRPLClient = dynamic(() => import("@nice-xrpl/react-xrpl").then(mod => mod.XRPLClient), { ssr: false });

  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // useEffect(() => {
  //   const connectToXRPL = async () => {
  //     try {
  //       const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  //       setConnectionStatus("Connecting...");
  //       await client.connect();
  //       setConnectionStatus("Connected");

  //       // Subscribe to an account
  //       // await client.request({
  //       //   command: "subscribe",
  //       //   accounts: ["rEMuMyGj2wMm3iJbeX1EvhVZjjzffrEG8y"],
  //       // });

  //       const response = await client.request({
  //         command: "account_info",
  //         account: "rEMuMyGj2wMm3iJbeX1EvhVZjjzffrEG8y",
  //         ledger_index: "validated",
  //       });

  //       setBalance(response.result.account_data.Balance);
  //       console.log("Account balance:", response.result.account_data.Balance);

        
  //       // client.on("message", message => {
  //       //   console.log("Received message:", message);
  //       // });

  //       // client.on("error", error => {
  //       //   console.error("WebSocket error:", error);
  //       //   setConnectionStatus(`Error: ${error.message}`);
  //       // });

  //       // client.on("disconnect", (code, reason) => {
  //       //   console.log("WebSocket disconnected:", code, reason);
  //       //   setConnectionStatus("Disconnected");
  //       // });

  //       setClient(client);
  //     } catch (error) {
  //       console.error("Error connecting to XRPL:", error);
  //       setConnectionStatus(`Error: ${error.message}`);
  //     }
  //   };

  //   connectToXRPL();

  //   // Cleanup on component unmount
  //   return () => {
  //     if (client) {
  //       client.disconnect();
  //     }
  //   };
  // }, []);

  // if (connectionStatus === "Initializing...") {
  //   return <div>Loading...</div>; // or a loading spinner
  // }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar />
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <ScaffoldEthApp>
            {/* <div>
              <div>Connection Status: {connectionStatus}</div>
              {connectionStatus === "Connected" && <div>XRPL Client Connected - Balance {balance}</div>}
            </div> */}
            {children}
          </ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
