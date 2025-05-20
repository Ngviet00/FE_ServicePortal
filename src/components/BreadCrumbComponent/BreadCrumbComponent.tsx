import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link, useLocation } from "react-router-dom";
import { capitalizeFirstLetter } from "@/lib";

export default function BreadCrumbComponent () {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <div className="dark:bg-[#454545] p-[10px] pl-[15px] rounded-[3px] bg-white shadow-[0px 12px 33px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A]" >
            <Breadcrumb>
                <BreadcrumbList className="text-sm">
                    <BreadcrumbItem>
                        <Link to="/" className="dark:text-white">Home</Link>
                    </BreadcrumbItem>
                    {
                        pathnames.map((name, index) => {
                            const to = "/" + pathnames.slice(0, index + 1).join("/");
                            const isLast = index === pathnames.length - 1;

                            return (
                                <div key={to} className="flex items-center">
                                    <BreadcrumbSeparator className="dark:text-white" />

                                    <BreadcrumbItem className="dark:text-white">
                                        {isLast ? (
                                            <BreadcrumbPage className="dark:text-white">
                                                {capitalizeFirstLetter(decodeURIComponent(name))}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild className="dark:text-white">
                                                <Link className="dark:text-white" to={to}>{capitalizeFirstLetter(decodeURIComponent(name))}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </div>
                            );
                        })
                    }
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}