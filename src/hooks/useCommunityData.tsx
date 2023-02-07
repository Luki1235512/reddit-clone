import { useRecoilState } from "recoil";
import { Community, CommunityState } from "../atoms/communitiesAtom";

const useCommunityData = () => {
    const [communityStateValue, setCommunityStateValue] = useRecoilState(CommunityState);

    const onJoinOrLeavecommunity = (communityData: Community, isJoined: boolean) => {
        // IS THE USER SIGNED IN?
            // IF NOT => OPEN AUTH MODAL
        
        if (isJoined) {
            leaveCommunity(communityData.id);
            return;
        }
        joinCommunity(communityData);
    };

    const joinCommunity = (communityData: Community) => {

    };

    const leaveCommunity = (communityId: string) => {

    };

    return {
        communityStateValue,
        onJoinOrLeavecommunity,
    };
};

export default useCommunityData;