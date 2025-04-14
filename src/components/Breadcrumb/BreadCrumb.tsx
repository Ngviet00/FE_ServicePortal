import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import "./style.css"
import { Link, useLocation } from "react-router-dom";
import { capitalizeFirstLetter } from "@/ultils";


export default function BreadCrumb () {

    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <div className="breadcrumb">
            <Breadcrumb>
                <BreadcrumbList className="text-sm">
                    <BreadcrumbItem>
                        <Link to="/">Home</Link>
                    </BreadcrumbItem>
                    {
                        pathnames.map((name, index) => {
                            const to = "/" + pathnames.slice(0, index + 1).join("/");
                            const isLast = index === pathnames.length - 1;

                            return (
                                <div key={to} className="flex items-center">
                                    <BreadcrumbSeparator />

                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>
                                                {capitalizeFirstLetter(decodeURIComponent(name))}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link to={to}>{capitalizeFirstLetter(decodeURIComponent(name))}</Link>
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