import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const GabuIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fillOpacity="0.3"/>
        <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm4 11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-8 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-4c-1.93 0-3.5-1.57-3.5-3.5S10.07 4.5 12 4.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" fillOpacity="0.1"/>
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M8.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm7 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
        <path d="M12 16.5c-2.33 0-4.32-1.45-5.12-3.5h10.24c-.8 2.05-2.79 3.5-5.12 3.5z"/>
    </svg>
);


export const CameraIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
    <path fillRule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10zm-2 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
    <path d="M16.5 16.5a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
  </svg>
);


export const CloseIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 0-.75.75v12c0 .414.336.75.75.75h2.25a.75.75 0 0 0 .75-.75v-12a.75.75 0 0 0-.75-.75H6.75Zm8.25 0a.75.75 0 0 0-.75.75v12c0 .414.336.75.75.75h2.25a.75.75 0 0 0 .75-.75v-12a.75.75 0 0 0-.75-.75H15Z" clipRule="evenodd" />
  </svg>
);

export const StopIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3-3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export const ImageIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
    </svg>
);

export const AudioIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
    </svg>
);

export const AttachmentIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.5 10.5a.75.75 0 001.06 1.06l10.5-10.5a.75.75 0 011.06 0l-9 9a2.25 2.25 0 000 3.182 2.25 2.25 0 003.182 0l9-9a.75.75 0 011.06 0l-9 9a3.75 3.75 0 11-5.303-5.303l10.5-10.5a3.75 3.75 0 115.303 5.303l-10.5 10.5a.75.75 0 01-1.06-1.06l10.5-10.5a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
    </svg>
);

export const AudioFileIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 01.097 1.05L13.85 12.15a2.25 2.25 0 01-3.422-.218L7.86 8.42a.75.75 0 00-1.22.87l2.035 3.86a3.75 3.75 0 005.704.364l6.198-9.45a.75.75 0 011.05-.097zM3 3.75A2.25 2.25 0 015.25 1.5h13.5A2.25 2.25 0 0121 3.75v16.5A2.25 2.25 0 0118.75 22.5H5.25A2.25 2.25 0 013 20.25V3.75z" clipRule="evenodd" />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85c-.09.5.055.995.442 1.336l1.261 1.019c.387.313.943.341 1.352.068l1.438-1.015c.409-.287.964-.242 1.352.068l1.26 1.019c.387.313.533.806.442 1.336l-.178 2.034c-.15.904.532 1.72.149 1.85l2.034.178c.5.09.995-.055 1.336-.442l1.019-1.26c.313-.387.341-.943.068-1.352l-1.015-1.438c-.287-.409-.242-.964.068-1.352l1.019-1.26c.313-.387.806-.533 1.336-.442l2.034.178c.904.151 1.72-.532 1.85-1.49l.178-2.034c.09-.5-.055-.995-.442-1.336l-1.26-1.019c-.387-.313-.943-.341-1.352-.068l-1.438 1.015c-.409.287-.964.242-1.352-.068l-1.26-1.019c-.387-.313-.533-.806-.442-1.336l.178-2.034c.15-.904-.532-1.72-1.49-1.85l-2.034-.178a1.5 1.5 0 00-1.336.442l-1.019 1.26c-.313-.387-.341-.943-.068 1.352l1.015 1.438c.287.409.242.964-.068 1.352l-1.019 1.26c-.313-.387-.806-.533-1.336-.442L9.05 5.85c-.904-.151-1.72.532-1.85 1.49L7.022 9.375a1.5 1.5 0 00-.442 1.336l1.26 1.019c.387.313.943.341 1.352.068l1.438-1.015c.409-.287.964-.242 1.352-.068l1.26 1.019c.387.313.533.806.442 1.336l-.178 2.034c-.15.904.532 1.72 1.49 1.85l2.034.178c.5.09.995-.055 1.336-.442l1.019-1.26c.313-.387.341-.943-.068-1.352l-1.015-1.438c-.287-.409-.242-.964.068-1.352l1.019-1.26c.313-.387.806-.533 1.336-.442l2.034.178c.904.151 1.72-.532 1.85-1.49l.178-2.034a1.5 1.5 0 00-.442-1.336l-1.26-1.019c-.387-.313-.943-.341-1.352-.068L14.95 5.51c-.409.287-.964.242-1.352-.068l-1.26-1.019a1.5 1.5 0 00-1.336-.442l-2.034.178c-.904.151-1.72-.532-1.85-1.49L7.022 3.817A1.875 1.875 0 018.877 2.25h6.246a1.875 1.875 0 011.855 1.567l.178 2.034c.09.5-.055.995-.442 1.336l-1.26 1.019c-.387-.313-.943-.341-1.352-.068l-1.438-1.015c-.409-.287-.964-.242-1.352-.068l-1.26 1.019c-.387-.313-.533-.806-.442-1.336l.178-2.034c.15-.904-.532-1.72-1.49-1.85L13.12 2.25h-2.042zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    </svg>
);

export const MicrophoneIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.654H5.852a.75.75 0 01-.75-.654L4.097 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452z" clipRule="evenodd" />
  </svg>
);

export const QuizIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.882 0-1.473.823-1.074 1.69.223.482.374.99.374 1.517 0 .445-.083.876-.235 1.284a.75.75 0 00.733.918h.281a.75.75 0 00.733-.918c.152-.408.235-.839.235-1.284 0-.527.151-1.035.374-1.517.399-.867-.192-1.69-1.074-1.69zM12 15a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V15.75A.75.75 0 0112 15z" clipRule="evenodd" />
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06l-3.103 3.104-1.593-1.593a.75.75 0 00-1.06 1.06l2.122 2.122a.75.75 0 001.06 0l3.624-3.624z" clipRule="evenodd" />
    </svg>
);

export const XCircleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
    </svg>
);