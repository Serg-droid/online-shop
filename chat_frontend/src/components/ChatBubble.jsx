import { AspectRatio, Avatar, Box, IconButton, Sheet, Stack, Typography } from '@mui/joy'
import {
    InsertDriveFileRounded as InsertDriveFileRoundedIcon,
    CelebrationOutlined as CelebrationOutlinedIcon,
    FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material'
import { useState } from 'react'

export function ChatBubble(props) {
    const {
        content,
        variant,
        timestamp,
        attachment = undefined,
        sender,
        you,
        companion,
        images,
    } = props
    const isSent = variant === 'sent'
    const [isHovered, setIsHovered] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [isCelebrated, setIsCelebrated] = useState(false)
    return (
        <Box sx={{ maxWidth: '60%', minWidth: 'auto' }}>
            <Stack
                direction='row'
                justifyContent='space-between'
                spacing={2}
                sx={{ mb: 0.25 }}
            >
                <Typography level='body-xs'>
                    {sender === you ? 'You' : companion.username}
                </Typography>
                <Typography level='body-xs'>{timestamp}</Typography>
            </Stack>
            {attachment ? (
                <Sheet
                    variant='outlined'
                    sx={{
                        px: 1.75,
                        py: 1.25,
                        borderRadius: 'lg',
                        borderTopRightRadius: isSent ? 0 : 'lg',
                        borderTopLeftRadius: isSent ? 'lg' : 0,
                    }}
                >
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                        <Avatar color='primary' size='lg'>
                            <InsertDriveFileRoundedIcon />
                        </Avatar>
                        <div>
                            <Typography fontSize='sm'>
                                {attachment.fileName}
                            </Typography>
                            <Typography level='body-sm'>
                                {attachment.size}
                            </Typography>
                        </div>
                    </Stack>
                </Sheet>
            ) : (
                <>
                    <Box
                        sx={{ position: 'relative' }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Sheet
                            color={isSent ? 'primary' : 'neutral'}
                            variant={isSent ? 'solid' : 'soft'}
                            sx={{
                                p: 1.25,
                                borderRadius: 'lg',
                                borderTopRightRadius: isSent ? 0 : 'lg',
                                borderTopLeftRadius: isSent ? 'lg' : 0,
                                backgroundColor: isSent
                                    ? 'var(--joy-palette-primary-solidBg)'
                                    : 'background.body',
                            }}
                        >
                            <Typography
                                level='body-sm'
                                sx={{
                                    color: isSent
                                        ? 'var(--joy-palette-common-white)'
                                        : 'var(--joy-palette-text-primary)',
                                }}
                            >
                                {content}
                            </Typography>
                        </Sheet>
                        {(isHovered || isLiked || isCelebrated) && (
                            <Stack
                                direction='row'
                                justifyContent={
                                    isSent ? 'flex-end' : 'flex-start'
                                }
                                spacing={0.5}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    p: 1.5,
                                    ...(isSent
                                        ? {
                                              left: 0,
                                              transform:
                                                  'translate(-100%, -50%)',
                                          }
                                        : {
                                              right: 0,
                                              transform:
                                                  'translate(100%, -50%)',
                                          }),
                                }}
                            >
                                <IconButton
                                    variant={isLiked ? 'soft' : 'plain'}
                                    color={isLiked ? 'danger' : 'neutral'}
                                    size='sm'
                                    onClick={() =>
                                        setIsLiked(prevState => !prevState)
                                    }
                                >
                                    {isLiked ? '❤️' : <FavoriteBorderIcon />}
                                </IconButton>
                                <IconButton
                                    variant={isCelebrated ? 'soft' : 'plain'}
                                    color={isCelebrated ? 'warning' : 'neutral'}
                                    size='sm'
                                    onClick={() =>
                                        setIsCelebrated(prevState => !prevState)
                                    }
                                >
                                    {isCelebrated ? (
                                        '🎉'
                                    ) : (
                                        <CelebrationOutlinedIcon />
                                    )}
                                </IconButton>
                            </Stack>
                        )}
                    </Box>
                    <Box>
                        {images.map((image, index) => {
                            return (
                                <AspectRatio variant="plain" sx={{ width: 300 }} key={index}>
                                  <img
                                    src={`${import.meta.env.VITE_MASTER_SERVER_DOMAIN}${image.image}`}
                                    alt=""
                                  />
                               </AspectRatio>
                            )
                        })}
                    </Box>
                </>
            )}
        </Box>
    )
}
