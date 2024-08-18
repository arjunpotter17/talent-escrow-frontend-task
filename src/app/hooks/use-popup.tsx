import React, {
  useState,
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import Popup from "../components/Popup/page";
import { setSubtitle } from "../utils/subtitle";


const PopupContext = createContext<Record<string, any>>({});

export const PopupProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [type, setType] = useState<"create" | "take" | "close">("create");
  const [txId, setTxId] = useState<string>("");

  const contextValue = useMemo(() => {
    return {
      showPopup,
      setShowPopup,
      setType,
      setTxId  
    };
  }, [showPopup, setShowPopup, setType, setTxId  ]);


  return (
    <PopupContext.Provider value={contextValue}>
      {showPopup && (
        <Popup
          title="Transaction Successful"
          subTitle={setSubtitle(type)}
          explorerLink={txId}
          onClose={() => {setShowPopup(false); setTxId(""); setType("create")}}
          
        />
      )}{" "}
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = (): Record<string, any> => useContext(PopupContext);
