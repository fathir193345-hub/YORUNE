import axios from "axios";

const STATUS_MAP = {
  RELEASING: "Ongoing",
  FINISHED: "Completed",
  NOT_YET_RELEASED: "Akan Tayang",
  CANCELLED: "Dibatalkan",
  HIATUS: "Hiatus"
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const q = (req.query.q || "").trim();

  if (!q) {
    return res.status(200).json([]);
  }

  const rawGenre = req.query.genre || null;
  const isTag = rawGenre === "Isekai";
  const genre = rawGenre && rawGenre !== "Semua" && !isTag ? rawGenre : null;
  const tag = isTag ? rawGenre : null;

  try {
    const response = await axios.post(
      "https://graphql.anilist.co",
      {
        query: `
          query ($search: String, $genre: String, $tag: String) {
            Page(page: 1, perPage: 30) {
              media(
                search: $search
                type: ANIME
                genre: $genre
                tag: $tag
              ) {
                id
                title {
                  romaji
                  english
                }
                status
                seasonYear
                episodes
                genres
                coverImage {
                  large
                }
              }
            }
          }
        `,
        variables: {
          search: q,
          genre,
          tag
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const list = response.data?.data?.Page?.media || [];

    return res.status(200).json(
      list.map(media => ({
        id: media.id,
        title: media.title.english || media.title.romaji,
        status: STATUS_MAP[media.status] || media.status,
        year: media.seasonYear,
        episodes: media.episodes ?? "?",
        genres: media.genres || [],
        poster: media.coverImage?.large || ""
      }))
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Gagal mengambil data AniList"
    });
  }
}
