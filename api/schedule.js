import axios from "axios";

// AniList's airingSchedules gives the next upcoming episode for every
// currently-releasing anime, sorted by airing time. We use that to build
// a weekly release calendar (day of week -> list of anime).

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const response = await axios.post(
      "https://graphql.anilist.co",
      {
        query: `
          query {
            Page(page: 1, perPage: 50) {
              airingSchedules(
                notYetAired: true
                sort: TIME
              ) {
                airingAt
                episode
                media {
                  id
                  title {
                    romaji
                    english
                  }
                  coverImage {
                    large
                  }
                  status
                }
              }
            }
          }
        `
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const list =
      response.data?.data?.Page?.airingSchedules || [];

    const result = list.map(item => {

      const date = new Date(item.airingAt * 1000);

      // Day of week & time, in WIB (Asia/Jakarta)
      const weekday = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        timeZone: "Asia/Jakarta"
      }).format(date);

      const time = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta"
      }).format(date);

      return {
        id: item.media.id,
        title: item.media.title.english || item.media.title.romaji,
        poster: item.media.coverImage?.large || "",
        episode: item.episode,
        airingAt: item.airingAt,
        weekday,
        time
      };

    });

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Gagal mengambil jadwal tayang"
    });
  }
}
