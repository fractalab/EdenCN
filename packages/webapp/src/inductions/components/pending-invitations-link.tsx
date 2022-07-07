import { useIsCommunityActive, Link } from "_app";

import { ROUTES } from "_app/routes";

export const PendingInvitationsLink = () => {
    const { data: isCommunityActive } = useIsCommunityActive();
    if (!isCommunityActive) return null;
    return (
        <Link
            href={`${ROUTES.INDUCTION.href}/pending-invitations`}
            className="block w-full my-4 text-center"
        >
            <span className="text-gray-400">
                查看所有進行中的邀請
            </span>
        </Link>
    );
};

export default PendingInvitationsLink;
