import React, { useEffect } from "react";
import AuthInputs from "./Inputs";
import OAuthButtons from "@/src/components/modal/auth/OAuthButtons";
import {
    Flex,
    ModalBody,
    ModalCloseButton,
    ModalHeader,
} from "@chakra-ui/react";
import { useRecoilState } from "recoil";
import { authModalState } from "@/src/atoms/authModalAtoms";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/src/firebase/clientApp";
import ResetPassword from "@/src/components/modal/auth/ResetPassword";
import { userState } from "@/src/atoms/userAtom";
import ModalWrapper from "../ModalWrapper";

const AuthModal: React.FC = () => {
    const [modalState, setModalState] = useRecoilState(authModalState);
    const handleClose = () => 
        setModalState((prev) => ({
            ...prev,
            open: false,
        }));

    const currentUser = useRecoilState(userState);
    const [user, error] = useAuthState(auth);

    const toggleView = (view: string) => {
        setModalState({
            ...modalState,
            view: view as typeof modalState.view,
        });
    };

    useEffect(() => {
        if (user) {
            handleClose();
        }
    }, [user]);

    return (
        <ModalWrapper isOpen={modalState.open} onClose={handleClose}>
          <ModalHeader display="flex" flexDirection="column" alignItems="center">
            {modalState.view === "login" && "Login"}
            {modalState.view === "signup" && "Sign Up"}
            {modalState.view === "resetPassword" && "Reset Password"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            pb={6}
          >
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="center"
              width="70%"
            >
              {modalState.view === "login" || modalState.view === "signup" ? (
                <>
                  <OAuthButtons />
                  OR
                  <AuthInputs toggleView={toggleView} />
                </>
              ) : (
                <ResetPassword toggleView={toggleView} />
              )}
            </Flex>
          </ModalBody>
        </ModalWrapper>
      );
};

export default AuthModal;
