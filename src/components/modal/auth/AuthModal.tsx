import React from "react";
import {
    Modal, ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import {useRecoilState} from "recoil";
import {authModalState} from "@/src/atoms/authModalAtoms";

const AuthModal: React.FC = () => {
    const [modalState, setModalState] = useRecoilState(authModalState);
    const handleClose = () => {
        setModalState((prev) => ({
            ...prev,
            open: false,
        }));
    };
    return (
        <>
            <Modal isOpen={modalState.open} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>Here is the modal body</ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AuthModal;
