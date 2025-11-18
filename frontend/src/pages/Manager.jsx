
import { useRef, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:3000/passwords";
const SECRET = import.meta.env.VITE_SECRET_KEY || "dev_secret_change_me";

const Manager = () => {
  const ref = useRef();
  const passwordRef = useRef();

  const [form, setform] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setPasswordArray] = useState([]);

  // ---- encryption helpers ----
  const encrypt = (plain) => {
    return CryptoJS.AES.encrypt(plain, SECRET).toString();
  };

  const decrypt = (cipher) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
      const text = bytes.toString(CryptoJS.enc.Utf8);
      return text || ""; // return empty string on failure
    } catch (e) {
      return "";
    }
  };

  // ---- fetch helper (adds auth header) ----
  const getTokenHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ---- get passwords from server and decrypt for display ----
  const getPasswords = async () => {
    try {
      const res = await fetch(API_BASE, {
        headers: {
          ...getTokenHeader(),
        },
      });
      if (!res.ok) {
        // if 401/403, maybe token expired
        if (res.status === 401 || res.status === 403) {
          toast.error("Authentication required. Please login again.");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();

      // Each item from server has `password` (encrypted). We'll keep both encrypted and decrypted for UI actions.
      const mapped = data.map((p) => ({
        ...p,
        decryptedPassword: p.password ? decrypt(p.password) : "",
      }));

      setPasswordArray(mapped);
    } catch (err) {
      console.error("getPasswords error:", err);
      toast.error("Unable to fetch passwords");
    }
  };

  useEffect(() => {
    getPasswords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard!", {
      position: "top-right",
      autoClose: 3000,
      theme: "dark",
    });
  };

  const showPassword = (itemId) => {
    // toggle an element's input type - we store shown state by switching input type in DOM like before
    // We'll find the input by id attribute (we'll render inputs with id `pw-{item.id}`)
    const input = document.querySelector(`#pw-${itemId}`);
    const eye = document.querySelector(`#eye-${itemId}`);
    if (!input) return;
    if (input.type === "password") {
      input.type = "text";
      if (eye) eye.src = "icons/eyecross.png";
    } else {
      input.type = "password";
      if (eye) eye.src = "icons/eye.png";
    }
  };

  const savePassword = async () => {
    if (form.site.length <= 3 || form.username.length <= 3 || form.password.length <= 3) {
      toast.error("Please fill all fields with minimum length 4");
      return;
    }

    try {
      const newId = form.id || uuidv4();
      const encryptedPassword = encrypt(form.password);

      const payload = {
        site: form.site,
        username: form.username,
        password: encryptedPassword,
        id: newId,
      };

      // If editing, backend expects same flow (we use delete then post pattern you had)
      if (form.id) {
        // delete old
        await fetch(API_BASE, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getTokenHeader(),
          },
          body: JSON.stringify({ id: form.id }),
        });
      }

      const postRes = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getTokenHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (!postRes.ok) throw new Error("Save failed");

      // Refresh authoritative list from server
      await getPasswords();

      setform({ site: "", username: "", password: "" });
      toast.success("Password saved!");
    } catch (err) {
      console.error("savePassword error:", err);
      toast.error("Error saving password");
    }
  };

  const deletePassword = async (id) => {
    const c = confirm("Do you really want to delete this password?");
    if (!c) return;

    try {
      const res = await fetch(API_BASE, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getTokenHeader(),
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Delete failed");

      // refresh list
      await getPasswords();
      toast.success("Password deleted!");
    } catch (err) {
      console.error("deletePassword error:", err);
      toast.error("Error deleting password");
    }
  };

  const editPassword = (id) => {
    const item = passwordArray.find((i) => i.id === id);
    if (!item) return;
    // set plaintext password into form (decrypt first)
    setform({ site: item.site, username: item.username, password: item.decryptedPassword, id: id });
    // optimistic UI removal from list while editing
    setPasswordArray((prev) => prev.filter((i) => i.id !== id));
  };

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <>
      <ToastContainer />
      <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]"></div>
      </div>

      <div className="p-3 md:mycontainer min-h-[88.2vh]">
        <h1 className="text-4xl text font-bold text-center">
          <span className="text-green-500"> &lt;</span>
          <span>Pass</span>
          <span className="text-green-500">OP/&gt;</span>
        </h1>
        <p className="text-green-900 text-lg text-center">Your own Password Manager</p>

        <div className="flex flex-col p-4 text-black gap-8 items-center">
          <input
            value={form.site}
            onChange={handleChange}
            placeholder="Enter website URL"
            className="rounded-full border border-green-500 w-full p-4 py-1"
            type="text"
            name="site"
            id="site"
          />
          <div className="flex flex-col md:flex-row w-full justify-between gap-8">
            <input
              value={form.username}
              onChange={handleChange}
              placeholder="Enter Username"
              className="rounded-full border border-green-500 w-full p-4 py-1"
              type="text"
              name="username"
              id="username"
            />
            <div className="relative">
              <input
                ref={passwordRef}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="rounded-full border border-green-500 w-full p-4 py-1"
                type="password"
                name="password"
                id="password"
              />
              <span className="absolute right-[3px] top-[4px] cursor-pointer" onClick={() => {
                // toggle reveal for form password field
                if (passwordRef.current.type === "password") passwordRef.current.type = "text";
                else passwordRef.current.type = "password";
              }}>
                <img ref={ref} className="p-1" width={26} src="icons/eye.png" alt="eye" />
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={savePassword} className="flex justify-center items-center gap-2 bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-fit border border-green-900">
              <lord-icon src="https://cdn.lordicon.com/jgnvfzqg.json" trigger="hover"></lord-icon>
              Save
            </button>
            <button onClick={() => { setform({ site: "", username: "", password: "" }); getPasswords(); }} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </div>

        <div className="passwords mt-8">
          <h2 className="font-bold text-2xl py-4">Your Passwords</h2>
          {passwordArray.length === 0 && <div> No passwords to show</div>}
          {passwordArray.length !== 0 && (
            <table className="table-auto w-full rounded-md overflow-hidden mb-10">
              <thead className="bg-green-800 text-white">
                <tr>
                  <th className="py-2">Site</th>
                  <th className="py-2">Username</th>
                  <th className="py-2">Password</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-green-100">
                {passwordArray.map((item, index) => {
                  return (
                    <tr key={item.id || index}>
                      <td className="py-2 border border-white text-center">
                        <div className="flex items-center justify-center ">
                          <a href={item.site} target="_blank" rel="noreferrer">{item.site}</a>
                          <div className="lordiconcopy size-7 cursor-pointer" onClick={() => { copyText(item.site); }}>
                            <lord-icon style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }} src="https://cdn.lordicon.com/iykgtsbt.json" trigger="hover"></lord-icon>
                          </div>
                        </div>
                      </td>

                      <td className="py-2 border border-white text-center">
                        <div className="flex items-center justify-center ">
                          <span>{item.username}</span>
                          <div className="lordiconcopy size-7 cursor-pointer" onClick={() => { copyText(item.username); }}>
                            <lord-icon style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }} src="https://cdn.lordicon.com/iykgtsbt.json" trigger="hover"></lord-icon>
                          </div>
                        </div>
                      </td>

                      <td className="py-2 border border-white text-center">
                        <div className="flex items-center justify-center ">
                          {/* masked input, show by toggling */}
                          <input id={`pw-${item.id}`} className="bg-transparent border-none text-center" readOnly value={"*".repeat(item.decryptedPassword?.length || 0)} type="password" />
                          <div className="lordiconcopy size-7 cursor-pointer" onClick={() => { copyText(item.decryptedPassword || ""); }}>
                            <lord-icon style={{ width: "25px", height: "25px", paddingTop: "3px", paddingLeft: "3px" }} src="https://cdn.lordicon.com/iykgtsbt.json" trigger="hover"></lord-icon>
                          </div>
                          <div className="ml-2 cursor-pointer" onClick={() => showPassword(item.id)}>
                            <img id={`eye-${item.id}`} width={26} src="icons/eye.png" alt="eye" />
                          </div>
                        </div>
                      </td>

                      <td className="justify-center py-2 border border-white text-center">
                        <span className="cursor-pointer mx-1" onClick={() => { editPassword(item.id); }}>
                          <lord-icon src="https://cdn.lordicon.com/gwlusjdu.json" trigger="hover" style={{ width: "25px", height: "25px" }}></lord-icon>
                        </span>
                        <span className="cursor-pointer mx-1" onClick={() => { deletePassword(item.id); }}>
                          <lord-icon src="https://cdn.lordicon.com/skkahier.json" trigger="hover" style={{ width: "25px", height: "25px" }}></lord-icon>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default Manager;
