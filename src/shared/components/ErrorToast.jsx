import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const ErrorToast = ({ title = "Có lỗi xảy ra", message }) => {
    return (
        <div className="fixed top-6 right-6 z-50 w-[320px]">
            <Alert variant="destructive" className="shadow-lg bg-white">
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
            </Alert>
        </div>
    )
}
