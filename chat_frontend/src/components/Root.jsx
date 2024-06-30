import { Outlet } from "react-router-dom";

export function Root() {
    return (
        <div>
            <div><Outlet></Outlet></div>
        </div>
    )
}