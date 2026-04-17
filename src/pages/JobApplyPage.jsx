import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useJobApply } from "@/features/jobs/api/useJobs"
import { useParams } from "react-router-dom"
export function JobApplyPage() {
    const { id } = useParams()
    const { data, loading } = useJobApply(id)
    console.log(data)



    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-full max-w-[70%]">
                <CardHeader>
                    <CardTitle>Đăng nhập vào tài khoản</CardTitle>
                    <CardDescription>
                        Nhập email bên dưới để đăng nhập vào tài khoản của bạn
                    </CardDescription>
                    <Button variant="link">Đăng ký</Button>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </a>
                                </div>
                                <Input id="password" type="password" required />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full">
                        Đăng nhập
                    </Button>
                    <Button variant="outline" className="w-full">
                        Đăng nhập với Google
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}