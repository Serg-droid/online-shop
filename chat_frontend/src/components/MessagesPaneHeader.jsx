import { Avatar, Button, Chip, IconButton, Stack, Typography } from '@mui/joy'
import {
    ArrowBackIosNewRounded as ArrowBackIosNewRoundedIcon,
    Circle as CircleIcon,
    PhoneInTalkRounded as PhoneInTalkRoundedIcon,
    MoreVertRounded as MoreVertRoundedIcon,
} from '@mui/icons-material'
import { StateContext } from '../state'
import { useContext } from 'react'

export const MessagesPaneHeader = props => {
    const { sender } = props
    console.log(sender.profile)

    const { callState, authState } = useContext(StateContext)

    function makeCall() {
        callState.make_call({ caller_id: authState.user_id, callee_id: ""+sender.id })
    }

    return (
        <Stack
            direction='row'
            justifyContent='space-between'
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.body',
            }}
            py={{ xs: 2, md: 2 }}
            px={{ xs: 1, md: 2 }}
        >
            <Stack
                direction='row'
                spacing={{ xs: 1, md: 2 }}
                alignItems='center'
            >
                <IconButton
                    variant='plain'
                    color='neutral'
                    size='sm'
                    sx={{
                        display: { xs: 'inline-flex', sm: 'none' },
                    }}
                    onClick={() => toggleMessagesPane()}
                >
                    <ArrowBackIosNewRoundedIcon />
                </IconButton>
                <Avatar
                    size='lg'
                    src={`${import.meta.env.VITE_MASTER_SERVER_DOMAIN}${
                        sender.profile.avatar
                    }`}
                />
                <div>
                    <Typography
                        fontWeight='lg'
                        fontSize='lg'
                        component='h2'
                        noWrap
                        endDecorator={
                            sender.profile.is_online ? (
                                <Chip
                                    variant='outlined'
                                    size='sm'
                                    color='neutral'
                                    sx={{
                                        borderRadius: 'sm',
                                    }}
                                    startDecorator={
                                        <CircleIcon
                                            sx={{ fontSize: 8 }}
                                            color='success'
                                        />
                                    }
                                    slotProps={{ root: { component: 'span' } }}
                                >
                                    Online
                                </Chip>
                            ) : undefined
                        }
                    >
                        {sender.name || 'No Name'}
                    </Typography>
                    <Typography level='body-sm'>{sender.username}</Typography>
                </div>
            </Stack>
            <Stack spacing={1} direction='row' alignItems='center'>
                <Button
                    startDecorator={<PhoneInTalkRoundedIcon />}
                    color='neutral'
                    variant='outlined'
                    size='sm'
                    sx={{
                        display: { xs: 'none', md: 'inline-flex' },
                    }}
                    onClick={makeCall}
                >
                    Call
                </Button>
                <Button
                    color='neutral'
                    variant='outlined'
                    size='sm'
                    sx={{
                        display: { xs: 'none', md: 'inline-flex' },
                    }}
                >
                    View profile
                </Button>
                <IconButton size='sm' variant='plain' color='neutral'>
                    <MoreVertRoundedIcon />
                </IconButton>
            </Stack>
        </Stack>
    )
}
