import axios from "axios";

export default async function handler(req, res) {
  try {
    const id = Number(req.query.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "ID anime tidak valid"
      });
    }

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

              startDate {
                year
                month
                day
              }

              endDate {
                year
                month
                day
              }

              seasonYear
              episodes
              duration

              trailer {
                id
                site
                thumbnail
              }

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

              streamingEpisodes {
                title
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

    const media =
      response.data?.data?.Media;

    if (!media) {
      return res.status(404).json({
        error: "Anime tidak ditemukan"
      });
    }

    res.status(200).json({

      id: media.id,

      title:
        media.title.english ||
        media.title.romaji ||
        media.title.native,

      nativeTitle:
        media.title.native,

      status:
        media.status,

      description:
        media.description || "",

      startDate:
        media.startDate,

      endDate:
        media.endDate,

      year:
        media.seasonYear,

      episodes:
        media.episodes,

      duration:
        media.duration,

      trailer:
        media.trailer,

      coverImage:
        media.coverImage?.large || "",

      bannerImage:
        media.bannerImage || "",

      genres:
        media.genres || [],

      averageScore:
        media.averageScore,

      studios:
        media.studios?.nodes?.map(
          studio => studio.name
        ) || [],

      streamingEpisodes:
        media.streamingEpisodes || []

    });

  } catch (error) {

    console.error(
      "AniList error:",
      error
    );

    res.status(500).json({
      error: "Gagal mengambil data AniList"
    });

  }
        }
