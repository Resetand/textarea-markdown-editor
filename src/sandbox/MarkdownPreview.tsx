import React, { FC } from "react";

import Color from "color";
import Showdown from "showdown";

import classNames from "classnames";
import styled from "styled-components";

export type MarkdownPreviewProps = {
    markdown: string;
    backdrop?: boolean;
};

export const markdownConverter = new Showdown.Converter({
    openLinksInNewWindow: true,
    tables: true,
    strikethrough: true,
    tasklists: true,
    ghCodeBlocks: true,
    ghMentions: true,
    emoji: true,
});

markdownConverter.setOption("simpleLineBreaks", true);

export const MarkdownPreview: FC<MarkdownPreviewProps> = ({ markdown, backdrop, ...props }) => {
    return (
        <PreviewWrapper
            className={classNames({ backdrop })}
            dangerouslySetInnerHTML={{ __html: markdownConverter.makeHtml(markdown) }}
            {...(props as any)}
        />
    );
};

const PreviewWrapper = styled.div`
    margin-top: 20px;
    padding: 0 5px;
    /* border-radius: 5px; */
    & h1,
    & h2,
    & h3,
    & h4,
    & h5,
    & h6 {
        margin-bottom: 0.5em;
    }
    & h1 {
        font-size: 2em;
    }
    & h2 {
        font-size: 1.5em;
    }
    & h3 {
        font-size: 1.2em;
    }

    & img {
        max-width: 100%;
    }

    blockquote {
        font-style: italic;
        color: ${Color("#000").alpha(0.7).string()};
        padding-left: 0.4em;
        border-left: 3px solid #78c0a8;
    }

    & ul,
    & ol {
        padding-left: 35px;
    }

    & p {
        margin-bottom: 1.5em;
    }

    & code,
    & pre {
        font-family: Monaco, SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace;
        margin: 0;
        padding: 0.1em 0.4em;
        font-size: 96%;
        background-color: #f0f2f5;
        border-radius: 3px;
    }
    & pre {
        padding: 0.3em 0.6em;
        border-radius: 4px;
    }

    & pre > code {
        padding: 0;
    }

    & hr {
        opacity: 0.4;
    }
`;
