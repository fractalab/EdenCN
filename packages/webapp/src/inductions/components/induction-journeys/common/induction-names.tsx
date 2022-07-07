import { ROUTES } from "_app/routes";
import { Text, Link } from "_app/ui";

import { useInductionParticipants } from "inductions/hooks";

export const InductionNames = ({
    inductionId,
    className,
}: {
    inductionId: string;
    className?: string;
}) => {
    const inductionMembers = useInductionParticipants(inductionId);
    const { inviter, endorsers } = inductionMembers;
    return (
        <section className={`space-y-1 ${className}`}>
            {inviter?.name && (
                <Text>
                    <span className="font-medium">邀請人：</span>{" "}
                    <Link href={`${ROUTES.MEMBERS.href}/${inviter.account}`}>
                        {inviter.name}
                    </Link>
                </Text>
            )}
            {endorsers.length && (
                <Text>
                    <span className="font-medium">見證人：</span>{" "}
                    {endorsers.map((member, index) => (
                        <span key={`endorser-${member.account}`}>
                            <Link
                                href={`${ROUTES.MEMBERS.href}/${member.account}`}
                            >
                                {member!.name}
                            </Link>
                            {index < endorsers.length - 1 ? ", " : ""}
                        </span>
                    ))}
                </Text>
            )}
        </section>
    );
};
