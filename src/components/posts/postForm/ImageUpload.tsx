import React from "react";
import { Button, Flex, Image, Stack } from "@chakra-ui/react";

type ImageUploadProps = {
    selectedFile?: string;
    onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setSelectedTab: (value: string) => void;
    setSelectedFile: (value: string) => void;
    selectFileRef: React.RefObject<HTMLInputElement>;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
    selectedFile,
    onSelectImage,
    setSelectedTab,
    setSelectedFile,
    selectFileRef
}) => {
    return (
        <Flex direction="column" justify="center" align="center" width="100%">
          {selectedFile ? (
            <>
              <Image
                src={selectedFile as string}
                maxWidth="400px"
                maxHeight="400px"
              />
              <Stack direction="row" mt={4}>
                <Button height="28px" onClick={() => setSelectedTab("Post")}>
                  Back to Post
                </Button>
                <Button
                  variant="outline"
                  height="28px"
                  onClick={() => setSelectedFile("")}
                >
                  Remove
                </Button>
              </Stack>
            </>
          ) : (
            <Flex
              justify="center"
              align="center"
              p={20}
              border="1px dashed"
              borderColor="gray.200"
              borderRadius={4}
              width="100%"
            >
              <Button
                variant="outline"
                height="28px"
                onClick={() => selectFileRef.current?.click()}
              >
                Upload
              </Button>
              <input
                id="file-upload"
                type="file"
                accept="image/x-png,image/gif,image/jpeg"
                hidden
                ref={selectFileRef}
                onChange={onSelectImage}
              />
            </Flex>
          )}
        </Flex>
      );
};

export default ImageUpload;