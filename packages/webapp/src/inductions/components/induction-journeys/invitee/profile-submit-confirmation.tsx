import { Button, Heading, Text } from "_app";

interface Props {
    isCommunityActive?: boolean;
}

export const InductionProfileSubmitConfirmation = ({
    isCommunityActive,
}: Props) => {
    return (
        <>
            <Heading size={1} className="mb-5">
                成功!
            </Heading>
            <div className="space-y-3 mb-8">
                <Text className="leading-normal">
                    感謝您提交您的資料。
                </Text>
                <Text className="leading-normal">
                    {isCommunityActive
                        ? "你的邀請人與見證人將會聯繫你，並安排好見證會的相關事宜。 你也可以主動聯繫他們，讓他們知道你已經準備好了。"
                        : "下一步是完成捐贈。當所有創始成員都填完資料並向社區進行捐贈後，系統將被激活。"}
                </Text>
            </div>
            <Button onClick={() => window.location.reload()} size="lg">
                {isCommunityActive ? "查看邀請狀態" : "下一步！"}
            </Button>
        </>
    );
};
