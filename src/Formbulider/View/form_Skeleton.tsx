import { Card, Skeleton } from "@nextui-org/react";

export default function App() {
    return (
        <Card className="w-full space-y-5 p-4" radius="lg">
            <div className="space-y-3">
                <Skeleton className="w-1/5 rounded">
                    <div className="h-3 w-3/5 rounded-lg bg-default-200" />
                </Skeleton>
            </div>
            <Skeleton className="rounded-lg">
                <div className="h-[300px] rounded-lg bg-default-300" />
            </Skeleton>
            <div className="space-y-3">
                <Skeleton className="w-1/5 rounded">
                    <div className="h-3 w-3/5 rounded-lg bg-default-200" />
                </Skeleton>
            </div>
            <Skeleton className="rounded-lg">
                <div className="h-[300px] rounded-lg bg-default-300" />
            </Skeleton>
            <div className="space-y-3">
                <Skeleton className="w-1/5 rounded">
                    <div className="h-3 w-3/5 rounded-lg bg-default-200" />
                </Skeleton>
            </div>
            <Skeleton className="rounded-lg">
                <div className="h-10 rounded-lg bg-default-300" />
            </Skeleton>

        </Card>
    );
}
