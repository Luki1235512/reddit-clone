import useDirectory from "@/src/hooks/useDirectory";
import { Flex, Icon, Image, MenuItem } from "@chakra-ui/react";
import { IconType } from "react-icons";

type DirectoryItemProps = {
    displayText: string;
    link: string;
    icon: IconType;
    iconColor: string;
    imageURL?: string;
};

const MenuListItem: React.FC<DirectoryItemProps> = ({
    displayText,
    link,
    icon,
    iconColor,
    imageURL,
}) => {

    const {onSelectMenuItem} = useDirectory();

    return (
        <MenuItem 
            width="100%" 
            fontSize="10pt" 
            _hover={{bg: "gray.100"}} 
            onClick={() => onSelectMenuItem({displayText, link, icon, iconColor, imageURL})}>
            <Flex alignItems="center">
                {imageURL ? (
                    <Image src={imageURL} borderRadius="full" boxSize="18px" mr={2} />
                ) : (
                    <Icon as={icon} fontSize={20} mr={2} color={iconColor} />
                )}
                {displayText}
            </Flex>
        </MenuItem>
    )
};

export default MenuListItem;