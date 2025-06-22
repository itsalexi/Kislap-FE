import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLinkedin,
    faGithub,
    faTwitter,
    faInstagram,
    faFacebook,
    faYoutube,
    faTiktok,
    faSnapchat,
    faPinterest,
    faReddit,
    faDiscord,
    faTelegram,
    faWhatsapp,
    faSlack,
    faMedium,
    faDev,
    faStackOverflow,
    faBehance,
    faDribbble,
    faSpotify,
    faItunes,
    faSoundcloud,
    faTwitch,
    faSteam,
    faXbox,
    faPlaystation,
    faFigma,
    faGoogle,
    faGitlab,
    faCodepen,
    faDropbox,
    faFlickr,
    faFoursquare,
    faMeetup,
    faPatreon,
    faTumblr,
    faVimeo,
    faVk,
    faYelp,
    faBluesky,
    faHashnode,
    faItchIo,
    faLine,
    faPixiv,
    faRavelry,
    faSquarespace,
    faThreads,
    faUpwork,
    faVine,
    faXiaohongshu,
    faYandex,
} from '@fortawesome/free-brands-svg-icons';
import { Mail, Phone, Globe, MapPin, User, ExternalLink } from 'lucide-react';

// Social media platforms with their Font Awesome icons and metadata
export const SOCIAL_PLATFORMS = [
    {
        value: 'linkedin',
        label: 'LinkedIn',
        icon: faLinkedin,
        color: '#0077B5',
    },
    { value: 'github', label: 'GitHub', icon: faGithub, color: '#333' },
    { value: 'twitter', label: 'Twitter/X', icon: faTwitter, color: '#1DA1F2' },
    {
        value: 'instagram',
        label: 'Instagram',
        icon: faInstagram,
        color: '#E4405F',
    },
    {
        value: 'facebook',
        label: 'Facebook',
        icon: faFacebook,
        color: '#1877F2',
    },
    { value: 'youtube', label: 'YouTube', icon: faYoutube, color: '#FF0000' },
    { value: 'tiktok', label: 'TikTok', icon: faTiktok, color: '#000000' },
    {
        value: 'snapchat',
        label: 'Snapchat',
        icon: faSnapchat,
        color: '#FFFC00',
    },
    {
        value: 'pinterest',
        label: 'Pinterest',
        icon: faPinterest,
        color: '#BD081C',
    },
    { value: 'reddit', label: 'Reddit', icon: faReddit, color: '#FF4500' },
    { value: 'discord', label: 'Discord', icon: faDiscord, color: '#5865F2' },
    {
        value: 'telegram',
        label: 'Telegram',
        icon: faTelegram,
        color: '#0088CC',
    },
    {
        value: 'whatsapp',
        label: 'WhatsApp',
        icon: faWhatsapp,
        color: '#25D366',
    },
    { value: 'slack', label: 'Slack', icon: faSlack, color: '#4A154B' },
    { value: 'medium', label: 'Medium', icon: faMedium, color: '#000000' },
    { value: 'dev.to', label: 'Dev.to', icon: faDev, color: '#0A0A0A' },
    {
        value: 'stackoverflow',
        label: 'Stack Overflow',
        icon: faStackOverflow,
        color: '#F48024',
    },
    { value: 'behance', label: 'Behance', icon: faBehance, color: '#1769FF' },
    {
        value: 'dribbble',
        label: 'Dribbble',
        icon: faDribbble,
        color: '#EA4C89',
    },
    { value: 'spotify', label: 'Spotify', icon: faSpotify, color: '#1DB954' },
    {
        value: 'apple-music',
        label: 'Apple Music',
        icon: faItunes,
        color: '#FA243C',
    },
    {
        value: 'soundcloud',
        label: 'SoundCloud',
        icon: faSoundcloud,
        color: '#FF5500',
    },
    { value: 'twitch', label: 'Twitch', icon: faTwitch, color: '#9146FF' },
    { value: 'steam', label: 'Steam', icon: faSteam, color: '#171a21' },
    { value: 'xbox', label: 'Xbox', icon: faXbox, color: '#107C10' },
    {
        value: 'playstation',
        label: 'PlayStation',
        icon: faPlaystation,
        color: '#003791',
    },
    { value: 'figma', label: 'Figma', icon: faFigma, color: '#F24E1E' },
    { value: 'google', label: 'Google', icon: faGoogle, color: '#4285F4' },
    { value: 'gitlab', label: 'GitLab', icon: faGitlab, color: '#FC6D26' },
    { value: 'codepen', label: 'CodePen', icon: faCodepen, color: '#000000' },
    { value: 'dropbox', label: 'Dropbox', icon: faDropbox, color: '#0061FF' },
    { value: 'flickr', label: 'Flickr', icon: faFlickr, color: '#FF0084' },
    {
        value: 'foursquare',
        label: 'Foursquare',
        icon: faFoursquare,
        color: '#F94877',
    },
    { value: 'meetup', label: 'Meetup', icon: faMeetup, color: '#ED1C40' },
    { value: 'patreon', label: 'Patreon', icon: faPatreon, color: '#FF424D' },
    { value: 'tumblr', label: 'Tumblr', icon: faTumblr, color: '#35465C' },
    { value: 'vimeo', label: 'Vimeo', icon: faVimeo, color: '#1AB7EA' },
    { value: 'vk', label: 'VK', icon: faVk, color: '#4680C2' },
    { value: 'yelp', label: 'Yelp', icon: faYelp, color: '#D32323' },
    { value: 'bsky.app', label: 'Bluesky', icon: faBluesky, color: '#0085FF' },
    {
        value: 'hashnode',
        label: 'Hashnode',
        icon: faHashnode,
        color: '#2962FF',
    },
    { value: 'itch.io', label: 'itch.io', icon: faItchIo, color: '#FA5C5C' },
    { value: 'line.me', label: 'LINE', icon: faLine, color: '#00C300' },
    { value: 'pixiv', label: 'Pixiv', icon: faPixiv, color: '#0096FA' },
    { value: 'ravelry', label: 'Ravelry', icon: faRavelry, color: '#B73164' },
    {
        value: 'squarespace',
        label: 'Squarespace',
        icon: faSquarespace,
        color: '#000000',
    },
    { value: 'threads', label: 'Threads', icon: faThreads, color: '#000000' },
    { value: 'upwork', label: 'Upwork', icon: faUpwork, color: '#6FDA44' },
    { value: 'vine', label: 'Vine', icon: faVine, color: '#00B488' },
    { value: 'yandex', label: 'Yandex', icon: faYandex, color: '#FF0000' },
    { value: 'external', label: 'External', icon: null, color: '#6B7280' },
];

// Contact info icons
export const CONTACT_ICONS = {
    email: Mail,
    phone: Phone,
    website: Globe,
    address: MapPin,
    user: User,
};

// Function to get platform data by platform
export const getPlatformData = (platform) => {
    return (
        SOCIAL_PLATFORMS.find((p) => p.value === platform?.toLowerCase()) ||
        SOCIAL_PLATFORMS.find((p) => p.value === 'external')
    );
};

// Function to get contact icon by type
export const getContactIcon = (type) => {
    return CONTACT_ICONS[type] || ExternalLink;
};

// Function to render social icon component
export const renderSocialIcon = (platform, props = {}) => {
    const platformData = getPlatformData(platform);

    if (!platformData || platformData.value === 'external') {
        return <ExternalLink {...props} />;
    }

    if (!platformData.icon) {
        return <ExternalLink {...props} />;
    }

    return <FontAwesomeIcon icon={platformData.icon} {...props} />;
};
