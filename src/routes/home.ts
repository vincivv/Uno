import { Router } from "express";

const router = Router();

// I commented it out to pass npm lint, uncomment if needed

// Basic Uno Theme Styles
// const unoStyles = `
// <style>
//   body {
//     background-color: #222;
//     color: white;
//     font-family: 'Arial Black', sans-serif;
//     text-align: center;
//     padding: 50px;
//   }
//   .card-container { display: flex; justify-content: center; gap: 20px; margin-top: 30px; }
//   .card {
//     width: 100px; height: 150px;
//     border-radius: 10px; border: 4px solid white;
//     display: flex; align-items: center; justify-content: center;
//     font-size: 3rem; text-shadow: 2px 2px black;
//     box-shadow: 0 4px 8px rgba(0,0,0,0.5);
//   }
//   .red { background-color: #ff5555; }
//   .blue { background-color: #5555ff; }
//   .yellow { background-color: #ffaa00; }
//   .green { background-color: #55aa55; }
//   .btn {
//     background: #eb1c24; color: white; padding: 10px 20px;
//     text-decoration: none; border-radius: 5px; font-weight: bold;
//   }
// </style>
// `;

router.get("/", (request, response) => {
  if (request.session.user?.id) {
    response.redirect("/lobby");
  } else {
    response.redirect("/auth/login");
  }

  //response.send(`
  //  ${unoStyles}
  //  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f9/UNO_Logo.svg" width="200" alt="Uno Logo">
  //   <h1>Welcome to UNO Online</h1>
  //   <p>Current Server Time: ${new Date().toLocaleTimeString()}</p>
  //   <div class="card-container">
  //     <div class="card red">7</div>
  //    <div class="card blue">2</div>
  //     <div class="card yellow">9</div>
  //   </div>
  //   <br><br>
  //   <a href="/lobby" class="btn">Join Game Lobby</a>
  // `);
});

export default router;
