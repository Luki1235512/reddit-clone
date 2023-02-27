import React from "react";
import { Flex } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { authModalState } from "@/src/atoms/authModalAtom";
import Login from "@/src/components/modal/auth/Login";
import SignUp from "@/src/components/modal/auth/SignUp";
import { ModalView } from "@/src/atoms/authModalAtom";

type AuthInputsProps = {
    toggleView: (view: ModalView) => void;
};

const AuthInputs: React.FC<AuthInputsProps> = ({toggleView}) => {
    const modalState = useRecoilValue(authModalState);

    return (
        <Flex direction="column" alignItems="center" width="100%" mt={4}>
            {modalState.view === "login" ? (
                <Login toggleView={toggleView} />
            ) : (
                <SignUp toggleView={toggleView} />
            )}
        </Flex>
    );
};

export default AuthInputs;
