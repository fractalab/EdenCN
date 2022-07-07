import { Container, Heading, Text } from "_app/ui";

export const ErrorLoadingElection = () => (
    <Container className="flex flex-col justify-center items-center py-16">
        <Heading size={4}>加載選舉信息時出錯</Heading>
        <Text>請嘗試通過刷新頁面重新加載。</Text>
    </Container>
);

export default ErrorLoadingElection;
