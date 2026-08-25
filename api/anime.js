import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const id = Number(req.query.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      error: "ID anime tidak valid"
    });
  }

  try {
    const response = await axios.post(
      "https://graphql.anilist.co",
      {
        query: `
          query ($id: Int!) {
            Media(id: $id, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              status
              description(asHtml: false)
              seasonYear
              episodes
              duration
              coverImage {
                large
              }
              bannerImage
              genres
              averageScore
              studios {
                nodes {
                  name
                }
              }
              trailer {
                id
                site
                thumbnail
              }
            }
          }
        `,
        variables: {
          id
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const media = response.data?.data?.Media;

    if (!media) {
      return res.status(404).json({
        error: "Anime tidak ditemukan"
      });
    }

    return res.status(200).json({
      id: media.id,
      title:
        media.title.english ||
        media.title.romaji ||
        media.title.native,
      status: media.status,
      description: media.description || "",
      year: media.seasonYear,
      episodes: media.episodes,
      duration: media.duration,
      coverImage: media.coverImage?.large || "",
      bannerImage: media.bannerImage || "",
      genres: media.genres || [],
      averageScore: media.averageScore,
      studios:
        media.studios?.nodes?.map(
          studio => studio.name
        ) || [],
      trailer: media.trailer || null
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Gagal mengambil data AniList"
    });
  }
}
