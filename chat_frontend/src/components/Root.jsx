import { Outlet } from "react-router-dom";

export function Root() {
    return (
        <div>
            <div>
                <a href={`${import.meta.env.VITE_MASTER_SERVER_DOMAIN}/product`}>Product</a>
            </div>
            <div><Outlet></Outlet></div>
        </div>
    )
}