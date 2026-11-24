# PROMPTS.md: Prompt history for Sociao

This is the developer's side of the conversation with Claude (Anthropic) while building Sociao, in the order the messages were sent. Prompts are quoted as written, typos included. Long pastes (error tracebacks, source files, screenshots) are shown as `[bracketed descriptions]` rather than reproduced.

**Stack that came out of it:** FastAPI + SQLAlchemy + SQLite, JWT auth with bcrypt, React + Vite.

---


## 1. Environment setup (Windows / PowerShell)

1. `[pasted error: uvicorn is not recognized as a command]`
2. `[pasted error: .\venv\Scripts\Activate.ps1 is not recognized]`
3. `[pasted output: path D:\Sociao App\backend, venv listed]`
4.  `[error: python can't open file 'D:\\Sociao App\\seed.py']`
5. Seeded 5 users and 10 posts.

## 2. Backend: auth and feed

6. {"detail":"Not Found"}
7. `[pasted error: ModuleNotFoundError: posts_routes]`
8. `[pasted error: ImportError: cannot import name 'PostOut' from 'schemas']`
9. what to do after authorizing the token
10. response code 422 validation error with 200 successful response
11. `[pasted 422 placeholder JSON]`
12. `[pasted error: requests ConnectionError]`
13. `[pasted output of test_api.py: LOGIN 200, FEED 200, LIKE toggles, FEED without token 401]`
14. output `[log: GET /posts HTTP/1.1 401 Unauthorized]` is it okay for get/post to be 401 unauthorized
15. next

## 3. Frontend setup

16. what are 7 login creds
17. login test is sucess 
18. how to sqllite viewer
19. before that can i explainlation and the archecture of how everthing works and what we did until so i can have clear understanding
20. proceed

## 4. Feed and profile screens

21. error `[Vite: Failed to resolve import "../components/PostCard" from "src/pages/Profile.jsx"]`
22. `[screenshot]` wrong layout not what i wanted
23. profile tab is not working
24. profile tab blank
25. `[console error: Profile.jsx:11 Uncaught ReferenceError: Cannot access 'location' before initialization]` import { useNavigate } from "react-router-dom"; is the code and from console the error is above
25. `[pasted the top of Profile.jsx using useLocation]`
26. working proceed next

## 5. Video viewer and comments

27. `[pasted test output: POST 6: 200, likes 2, comments 5, shares 12; SHARE 200; MISSING POST 404]`
28. comments tab still disabled
28. `[pasted VideoViewer.jsx]`
29. comments are still coming soon
30. `[pasted PostCard.jsx]`
31. comments inside video working but not in posts
32. `[pasted CommentsSheet.jsx]` both postcard and videoviewer not working
33. cant type in comments under postcards
34. next

## 6. Messages

35. `[pasted error: TypeError: string indices must be integers, not 'str' in test_messages.py]`
36. `[pasted test output: INBOX 200, THREAD 200, READ 200, SEND 201, NOT MY CHAT 404]`
37. `[pasted App.jsx with a stray route and missing Soon placeholder]`
38. in inbox profiles appear to be big square change small circles like in instagram
39. done next

## 7. Create post and uploads

40. `[pasted App.jsx with Create imported but route still a placeholder]`
41. posting works but is it possible to make it access files from device to post
42. i want to removie image and video link i want it to be just uploaded from device
43. remove music option in the video
44. proceed

## 8. Auth routes bug and followers/following

45. log in and sign up pages are not working
46. for both loggin and creating new account its gives not found
47. no auth section in http://127.0.0.1:8000/docs
48. `[pasted main.py]`
49. still no auth section
50. `[pasted error: AttributeError: '_IncludedRouter' object has no attribute 'path']`
51. `[pasted list of API paths from openapi(): no /auth routes]`
52. after this following and followers pages show not found
53. `[pasted log: GET /users/me/following?q= 404 Not Found, plus two Route lines]`
54. `[pasted error: taskkill /PID <number> /F, the '<' operator is reserved]`
55. under user no following and followers
56. okay its what else left to do

## 9. Seed videos, edit profile, settings

57. videos not playing
58. https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 doesnt work when run directly on browser
59. okay its working perfectly lets proced with settings


## 10. Wrap-up

60. full prompt history for this project for PROMPTS.md to publish it to my github

---