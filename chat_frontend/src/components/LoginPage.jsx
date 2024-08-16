import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Button, CssBaseline, FormControl, FormLabel, Input, Typography } from "@mui/joy";

export function LoginPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [login, setLogin] = useState("");

  const onFormSubmit = async (e) => {
    e.preventDefault();
    console.log(password, login);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_MASTER_SERVER_DOMAIN}chat/api-token-auth/`,
        {
          username: login,
          password: password,
        },
      );
      alert(res)
      localStorage.setItem("token", res.data.token);
      navigate("/chats_list/");
    } catch (e) {
      alert(JSON.stringify(e))
      throw e;
    }
  };

  return (
    <div>
      <CssBaseline />
      <Typography level="h4" component="h1">
        Login page
      </Typography>
      <form onSubmit={onFormSubmit}>
        <FormControl>
          <FormLabel>Логин</FormLabel>
          <Input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            id="login"
            type="text"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Пароль</FormLabel>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            type="password"
          />
        </FormControl>
        <Button type="submit" sx={{ mt: 1 /* margin top */ }}>Submit</Button>
      </form>
    </div>
  );
}
