import express from "express";
import cors from "cors";

import {
  getAnimeSummary,
  getAnimeDetail
} from "./anilist.js";


const app =
  express();


app.use(cors());

app.use(
  express.json()
);


/* =========================
   STATUS
========================= */

app.get(
  "/",
  (req, res) => {

    res.json({
      name: "Yorune API",
      status: "online"
    });

  }
);


/* =========================
   SEARCH
========================= */

app.get(
  "/api/search",
  async (req, res) => {

    try {

      const query =
        String(
          req.query.q || ""
        ).trim();


      if (!query) {

        return res.status(400).json({
          error: "Query kosong"
        });

      }


      const results =
        await getAnimeSummary(
          query
        );


      res.json({
        results
      });


    } catch (error) {

      console.error(
        "Search error:",
        error
      );


      res.status(500).json({
        error: "Gagal mencari anime"
      });

    }

  }
);


/* =========================
   DETAIL
========================= */

app.get(
  "/api/anime/:id",
  async (req, res) => {

    try {

      const id =
        Number(
          req.params.id
        );


      if (!Number.isInteger(id)) {

        return res.status(400).json({
          error: "ID anime tidak valid"
        });

      }


      const anime =
        await getAnimeDetail(id);


      res.json(anime);


    } catch (error) {

      console.error(
        "Detail error:",
        error
      );


      res.status(404).json({
        error: "Anime tidak ditemukan"
      });

    }

  }
);


/* =========================
   START
========================= */

const PORT =
  process.env.PORT || 3000;


app.listen(
  PORT,
  () => {

    console.log(
      `Yorune API berjalan di port ${PORT}`
    );

  }
);
