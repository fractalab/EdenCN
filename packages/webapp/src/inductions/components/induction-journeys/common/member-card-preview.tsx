import { Card } from "_app";
import { Member, MemberHoloCard, MemberCard } from "members";

export const MemberCardPreview = ({
    cardTitle = "被邀請人信息",
    member,
}: {
    cardTitle?: string;
    member: Member;
}) => (
    <Card title={cardTitle} titleSize={2}>
        <div className="flex justify-center items-center space-y-10 xl:space-y-0 xl:space-x-10 flex-col xl:flex-row">
            <div className="max-w-xl">
                <MemberHoloCard member={member} inducted={false} />
            </div>
            <MemberCard member={member} />
        </div>
    </Card>
);
