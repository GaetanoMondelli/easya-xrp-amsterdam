import { useEffect, useState } from "react";
import { XRPLClient } from "@nice-xrpl/react-xrpl";

const XRPLProvider = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return <XRPLClient>{children}</XRPLClient>;
};

export default XRPLProvider;
