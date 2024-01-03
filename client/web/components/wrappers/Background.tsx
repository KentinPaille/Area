import classnames from "classnames"
import { PropsWithChildren } from "react";

interface BackgroundProps {
    className?: string;
}

const Background = ({ children, className }: PropsWithChildren<BackgroundProps>) => {
    return (
        <div className={classnames(className, "bg-[#121212] min-h-screen")}>
            {children}
        </div>
    )
}

export default Background
