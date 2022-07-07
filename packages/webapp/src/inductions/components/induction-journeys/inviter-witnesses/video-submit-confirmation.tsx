import { Button, Heading, Text } from "_app";

export const InductionVideoSubmitConfirmation = () => {
    return (
        <>
            <Heading size={1} className="mb-5">
                己收到
            </Heading>
            <div className="space-y-3 mb-8">
                <Text className="leading-normal">
                    你上傳了見證會視頻。
                </Text>
                <Text className="leading-normal">
                    所有見證人（包括邀請人）對準成員進行認證。是時候聯繫見證人，告訴他們被邀請人正在等待確認。
                </Text>
            </div>
            <Button onClick={() => window.location.reload()} size="lg">
                下一步！
            </Button>
        </>
    );
};
