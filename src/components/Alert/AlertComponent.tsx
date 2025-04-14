import { AlertCircle } from "lucide-react"

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

interface AlertSuccessProps {
    message: string;
  }

export const AlertSuccess = ({message}: AlertSuccessProps ) => {
    return (
        <Alert className="border-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="text-green-800">
                {message}
            </AlertDescription>
        </Alert>
      )
}


export const AlertError = ({message}: AlertSuccessProps ) => {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                {message}
            </AlertDescription>
        </Alert>
      )
}