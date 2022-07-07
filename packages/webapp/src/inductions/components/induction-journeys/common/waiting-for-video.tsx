import { Heading, Text } from "_app";
import { getInductionRemainingTimeDays, InductionNames } from "inductions";
import { Induction } from "inductions/interfaces";

export const WaitingForVideo = ({ induction }: { induction: Induction }) => {
    return (
        <>
            <Heading size={1} className="mb-5">
                待舉行見證會
            </Heading>
            <div className="space-y-3">
                <Text className="leading-normal">
                你的邀請人或者其中一位見證人會聯繫你，與你確認在某個時間為你舉行一個短暫的，會被錄製的視頻見證會。
                </Text>
                <InductionNames inductionId={induction.id} />
                <Text className="leading-normal">
                如果你們已經舉行了視頻見證會，你可以聯繫你的邀請人或見證人在此上傳視頻。
                </Text>
                <Text className="leading-normal">
                    <span className="font-medium">
                        請注意，這個邀請仍然處於待完成狀態，並且有效期為 {" "}
                        {getInductionRemainingTimeDays(induction)} .
                    </span>{" "}天，
                    如果超時沒有完成全流程，則需要重新發起邀請。
                </Text>
                <Text className="leading-normal">
                    與此同時，請再次核對下面的個人信息。
                </Text>
            </div>
        </>
    );
};
