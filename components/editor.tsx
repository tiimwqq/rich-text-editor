"use client";

import {
    EditorBubble,
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandItem,
    EditorCommandList,
    EditorContent,
    type EditorInstance,
    EditorRoot,
    type JSONContent,
    handleCommandNavigation,
} from "novel";
import { defaultExtensions } from "./extensions";
import { useDebouncedCallback } from "use-debounce";
import React, { useEffect, useState } from 'react';
import { slashCommand, suggestionItems } from "./slash-command";
import { NodeSelector } from "./selectors/node-selector";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/lnik-selector";
import { TextButtons } from "./selectors/text-buttons";
import { Separator } from "./ui/separator";
import { MathSelector } from "./selectors/math-selecotr";

const Editor: React.FC = () => {
    const [content, setContent] = useState<undefined | JSONContent>(undefined);
    const [saveStatus, setSaveStatus] = useState<string>('saved');
    const [openNode, setOpenNode] = useState(false);
    const [openColor, setOpenColor] = useState(false);
    const [openLink, setOpenLink] = useState(false);
    const [charsCount, setCharsCount] = useState();
    const extensions = [...defaultExtensions, slashCommand];

    const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
        const json = editor.getJSON();
        setCharsCount(editor.storage.characterCount.words());
        window.localStorage.setItem("novel-content", JSON.stringify(json));
        setSaveStatus("Saved");
    }, 500);

    useEffect(() => {
        const content = window.localStorage.getItem("novel-content");
        if (content) {
            setContent(JSON.parse(content))
        }
        else {
            setContent({ type: "doc", content: [] });
        }
    }, []);

    if (!content) return <div>Loading...</div>;

    return (
        <div className="relative w-full max-w-screen-lg">
            <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
                <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus}</div>
                <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
                    {charsCount} Words
                </div>
            </div>
            <EditorRoot>
                <EditorContent
                    initialContent={content}
                    onUpdate={({ editor }) => {
                        setSaveStatus('unsaved')
                        debouncedUpdates(editor);
                    }}
                    editorProps={{
                        handleDOMEvents: {
                            keydown: (_view, event) => handleCommandNavigation(event),
                        },
                        attributes: {
                            class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
                        }
                    }}
                    className="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"
                    extensions={extensions}
                >
                    <EditorCommand className='z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all'>
                        <EditorCommandEmpty className='px-2 text-muted-foreground'>No results</EditorCommandEmpty>
                        <EditorCommandList>
                            {suggestionItems.map((item,) => (
                                <EditorCommandItem
                                    value={item.title}
                                    onCommand={(val) => item.command?.(val)}
                                    key={item.title}
                                    className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className='font-medium'>{item.title}</p>
                                        <p className='text-xs text-muted-foreground'>{item.description}</p>
                                    </div>
                                </EditorCommandItem>
                            ))}
                        </EditorCommandList>
                    </EditorCommand>
                    <EditorBubble
                        tippyOptions={{
                            placement: "top",
                        }}
                        className='flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl'>
                        <Separator orientation="vertical" />
                        <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                        <Separator orientation="vertical" />
                        <LinkSelector open={openLink} onOpenChange={setOpenLink} />
                        <Separator orientation="vertical" />
                        <MathSelector />
                        <Separator orientation="vertical" />
                        <TextButtons />
                        <Separator orientation="vertical" />
                        <ColorSelector open={openColor} onOpenChange={setOpenColor} />
                    </EditorBubble>
                </EditorContent>
            </EditorRoot>
        </div>
    );
};

export default Editor;

