export interface Event {
  id: string
  name: string
  date: string
  time: string
  location: string
  category: string
  price: number
  image: string
  soldTickets: number
  totalTickets: number
  artistId: string
  venueId: string
}

export interface CommunityEvent {
  title: string
  link: string
}

export interface Artist {
  id: string
  name: string
  image: string
  bio: string
  social: {
    twitter?: string
    instagram?: string
    website?: string
  }
  communityEvents: CommunityEvent[]
}

export interface Venue {
  id: string
  name: string
  image: string
  bio: string
  social: {
    twitter?: string
    instagram?: string
    website?: string
  }
  communityEvents: CommunityEvent[]
}

export const artists: Artist[] = [
  {
    id: "a1",
    name: "Phantom Flow",
    image: "/cypher.png",
    bio: "DJ Crypto is a pioneer in blending electronic music with blockchain themes, energizing crowds worldwide.",
    social: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
    },
    communityEvents: [
      { title: "AMA with DJ Crypto", link: "https://example.com/ama" },
      { title: "Community Remix Contest", link: "https://example.com/remix" },
    ],
  },
  {
    id: "a2",
    name: "Aura Vibe",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    bio: "A group of digital creators pushing the boundaries of art and technology.",
    social: {
      twitter: "https://twitter.com",
      website: "https://example.com",
    },
    communityEvents: [
      { title: "Monthly Art Drop", link: "https://example.com/drop" },
    ],
  },
]

export const venues: Venue[] = [
  {
    id: "v1",
    name: "Metaverse Arena",
    image: "/metaverse_arena.png",
    bio: "A state-of-the-art virtual venue hosting immersive events in the metaverse.",
    social: {
      website: "https://example.com",
    },
    communityEvents: [
      { title: "Virtual Tour", link: "https://example.com/tour" },
    ],
  },
  {
    id: "v2",
    name: "Blockchain Center",
    image: "/blockchain_center.png",
    bio: "The hub for all things blockchain, offering conferences and hackathons year round.",
    social: {
      twitter: "https://twitter.com",
      website: "https://example.com",
    },
    communityEvents: [
      { title: "Weekly Meetup", link: "https://example.com/meet" },
    ],
  },
]

export const events: Event[] = [
  {
    id: "1",
    name: "Blockchain Summit 2023",
    date: "June 15, 2023",
    time: "10:00 AM",
    location: "San Francisco, CA",
    category: "Conference",
    price: 0.15,
    image: "https://www.cryptotimes.io/wp-content/uploads/2025/03/DC-BLOCKCHAIN-SUMMIT-2025.jpg",
    soldTickets: 156,
    totalTickets: 200,
    artistId: "a2",
    venueId: "v2",
  },
  {
    id: "2",
    name: "NFT Art Exhibition",
    date: "July 22, 2023",
    time: "6:00 PM",
    location: "New York, NY",
    category: "Exhibition",
    price: 0.08,
    image: "https://www.tokyoweekender.com/wp-content/uploads/2021/07/CrypTOKYO-Press-Preview-and-VIP-invite-2-1.jpg",
    soldTickets: 89,
    totalTickets: 150,
    artistId: "a2",
    venueId: "v2",
  },
  {
    id: "3",
    name: "Web3 Music Festival",
    date: "August 5, 2023",
    time: "4:00 PM",
    location: "Miami, FL",
    category: "Festival",
    price: 0.25,
    image: "https://www.billboard.com/wp-content/uploads/2022/03/BILLBOARD-BLOCKCHAIN-02-b-Explainer-Shira-Inbar-1548.jpg?w=681&h=383&crop=1",
    soldTickets: 412,
    totalTickets: 500,
    artistId: "a1",
    venueId: "v1",
  },
  {
    id: "4",
    name: "DeFi Developer Conference",
    date: "September 10, 2023",
    time: "9:00 AM",
    location: "Austin, TX",
    category: "Conference",
    price: 0.12,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuAdxCvhlZ3iQmT_guNOl6ipJ3SoFpKDvYjT9l4YTIgMFrCA6rzn2M7uIv1__7rjjLzTI&usqp=CAU",
    soldTickets: 78,
    totalTickets: 300,
    artistId: "a2",
    venueId: "v2",
  },
  {
    id: "5",
    name: "Metaverse Concert",
    date: "October 18, 2023",
    time: "8:00 PM",
    location: "Los Angeles, CA",
    category: "Concert",
    price: 0.18,
    image: "https://images.theconversation.com/files/414962/original/file-20210806-17-jibbct.jpg?ixlib=rb-4.1.0&rect=0%2C5%2C2000%2C1116&q=20&auto=format&w=320&fit=clip&dpr=2&usm=12&cs=strip",
    soldTickets: 245,
    totalTickets: 400,
    artistId: "a1",
    venueId: "v1",
  },
  {
    id: "6",
    name: "Crypto Gaming Tournament",
    date: "November 25, 2023",
    time: "2:00 PM",
    location: "Seattle, WA",
    category: "Gaming",
    price: 0.05,
    image: "https://venturebeat.com/wp-content/uploads/2021/03/article23-1.jpg",
    soldTickets: 120,
    totalTickets: 250,
    artistId: "a1",
    venueId: "v2",
  },
]
