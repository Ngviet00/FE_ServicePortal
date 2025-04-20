import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "react-i18next"

interface SelectComponentProps {
    label: string
    value: string
    options: { label: string; value: string }[]
    onChange: (value: string) => void,
	isTranslate: boolean | false
}

export function SelectComponent(data: SelectComponentProps) {
	const { t } = useTranslation();
	
	return (
		<Select value={data.value} onValueChange={data.onChange}>
			<SelectTrigger className="w-full hover:cursor-pointer" >
				<SelectValue className="w-full" placeholder={`Select ${data.label}`} />
			</SelectTrigger>
			<SelectContent className="w-full">
				<SelectGroup>
					{
						data.options.map((item) => (
							<SelectItem className="w-full" key={data.isTranslate ? t(item.label) : item.label} value={item.value}>{data.isTranslate ? t(item.label) : item.label} </SelectItem>
						))
					}
				</SelectGroup>
			</SelectContent>
		</Select>
	)
}
