import { Button, Spinner } from "@heroui/react";
import { LucideIcon } from "lucide-react";

type ActionButtonProps = {
    id?: string | number;
    loading?: boolean;
    disabled?: boolean;
    onAction: (id?: string | number) => void;
    ariaLabel: string;
    icon: LucideIcon;
    variant?: "ghost" | "flat" | "solid" | "bordered" | "light" | "faded" | "shadow";
    size?: "sm" | "md" | "lg";
    className?: string;
    isIconOnly?: boolean;
}

export function ActionButton({
    id,
    loading = false,
    disabled = false,
    onAction,
    ariaLabel,
    icon: Icon,
    variant = "ghost",
    size = "md",
    className = "",
    isIconOnly = false
}: ActionButtonProps) {
    return (
        <Button
            variant={variant}
            size={size}
            isIconOnly={isIconOnly}
            onPress={() => onAction(id)}
            disabled={disabled || loading}
            aria-label={ariaLabel}
            className={`${loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
            {loading ? (
                <Spinner classNames={{ label: "text-foreground" }} variant="dots" />
            ) : (
                <Icon className="h-4 w-4" />
            )}
        </Button>
    );
}
