import { CssBaseline, CssVarsProvider } from '@mui/joy'
import { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { CallStatus, StateContext } from '../state'
import { observer } from 'mobx-react-lite'
import { IncomingCall } from './Call/IncomingCall'

export const Root = observer(() => {
    const { callState } = useContext(StateContext)

    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            <div>
                <div>
                    {callState.call_status ===
                        CallStatus.INCOMING_CALL_PENDING && <IncomingCall />}
                    <a
                        href={`${
                            import.meta.env.VITE_MASTER_SERVER_DOMAIN
                        }/product`}
                    >
                        Product
                    </a>
                </div>
                <div>
                    <Outlet></Outlet>
                </div>
            </div>
        </CssVarsProvider>
    )
})
