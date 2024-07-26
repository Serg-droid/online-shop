import { Box, Button, FormControl, IconButton, Stack, Textarea } from "@mui/joy";

import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import StrikethroughSRoundedIcon from '@mui/icons-material/StrikethroughSRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useRef, useState } from "react";

export default function MessageInput(props) {
    const { textAreaValue, setTextAreaValue, onSubmit } = props;
    const textAreaRef = useRef(null);

    const fileInputRef = useRef(null)

    const [files, setFiles] = useState([])
    const onFileInputChange = (e) => {
      setFiles(Array.from(e.target.files))
    }

    const handleClick = () => {

      if (textAreaValue.trim() !== '' || files.length > 0) {
        onSubmit(files);
        setTextAreaValue('');
        setFiles([])
        console.log(fileInputRef.current)
        fileInputRef.current.value = null
      }
    };
    return (
      <Box sx={{ px: 2, pb: 3 }}>
        <FormControl>
          <Textarea
            placeholder="Type something here…"
            aria-label="Message"
            ref={textAreaRef}
            onChange={(e) => {
              setTextAreaValue(e.target.value);
            }}
            value={textAreaValue}
            minRows={3}
            maxRows={10}
            endDecorator={
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexGrow={1}
                sx={{
                  py: 1,
                  pr: 1,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <div>
                  <IconButton size="sm" variant="plain" color="neutral">
                    <FormatBoldRoundedIcon />
                  </IconButton>
                  <IconButton size="sm" variant="plain" color="neutral">
                    <FormatItalicRoundedIcon />
                  </IconButton>
                  <IconButton size="sm" variant="plain" color="neutral">
                    <StrikethroughSRoundedIcon />
                  </IconButton>
                  <IconButton size="sm" variant="plain" color="neutral">
                    <FormatListBulletedRoundedIcon />
                  </IconButton>
                  <label htmlFor="file">File</label>
                  <input ref={fileInputRef} multiple id="file" name="file" type="file" onChange={onFileInputChange} />
                </div>
                <Button
                  size="sm"
                  color="primary"
                  sx={{ alignSelf: 'center', borderRadius: 'sm' }}
                  endDecorator={<SendRoundedIcon />}
                  onClick={handleClick}
                >
                  Send
                </Button>
              </Stack>
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                handleClick();
              }
            }}
            sx={{
              '& textarea:first-of-type': {
                minHeight: 72,
              },
            }}
          />
        </FormControl>
      </Box>
    );
  }