import { LucideHelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InfoTooltipProps {
  content: string
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <LucideHelpCircle className="h-4 w-4" />
            <span className="sr-only">More info</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px] text-center">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
