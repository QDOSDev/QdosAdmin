import React, { useEffect } from "react";

interface LinkStyle {
    width: string;
    height: string;
    background: string;
}

interface LinkHandlerProps {
    children: React.ReactNode;
}

const LinkHandler: React.FC<LinkHandlerProps> = ({ children }) => {
    const LINK_STYLES: any = {
        "/addCompany": {
            width: "90%",
            height: "100vh",
            background: "white",
            title: 'lead'
        },
  


    };


    const matchDynamicPath = (href: string): { match: boolean; style?: any } => {
        for (const pattern in LINK_STYLES) {

            const regexPattern = new RegExp(
                `^${pattern.replace(/:[^/]+/g, "([^/]+)")}$`
            );

            if (regexPattern.test(href)) {
                return { match: true, style: LINK_STYLES[pattern] };
            }
        }
        return { match: false };
    };
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            console.log(target)
           
            
            const href: any = target.getAttribute("data-url");
   
            
            if (href || target.tagName.toLowerCase() === "a") {


                const { match, style } = matchDynamicPath(href);
                const existingIframe = document.getElementById("custom-iframe");

                if (existingIframe) {
                    existingIframe.remove();
                }

                if (match && style) {
                    e.preventDefault();

                    document.body.style.overflow = "hidden";

                    const sidePanelOverlay = document.createElement("div");
                    sidePanelOverlay.className = "side-panel side-panel-overlay side-panel-overlay-open";
                    sidePanelOverlay.style.cssText = `
                        z-index: 1250 !important;
                        left: 0px;
                        top: 0px;
                        right: 0;
                        height: 100%;
                        transform: translateX(100%);
                        position: fixed;
                        transition: transform 300ms ease;`;
                    const sidePanelContainer = document.createElement("div");
                    sidePanelContainer.className = "side-panel side-panel-container";
                    sidePanelContainer.style.cssText = `width: ${style.width}; height: 100%; max-width: 1800; transform: translateX(0%);`;

                    const contentContainer = document.createElement("div");
                    contentContainer.className = "side-panel-content-container";

                    const iframe = document.createElement("iframe");
                    iframe.src = href;
                    iframe.style.cssText = "width: 100%; height: 100%;";
                    contentContainer.appendChild(iframe);

                    const sidePanelLabels = document.createElement("div");
                    sidePanelLabels.className = "side-panel-labels";
                    sidePanelLabels.style.top = "17px";

                    const sidePanelLabel = document.createElement("div");
                    sidePanelLabel.className = "side-panel-label";
                    sidePanelLabel.style.backgroundColor = "rgba(153, 133, 221, 0.95)";
                    sidePanelLabel.style.maxWidth = "215px";

                    const labelIconBox = document.createElement("div");
                    labelIconBox.className = "side-panel-label-icon-box";
                    labelIconBox.setAttribute("title", "Close");

                    const labelIcon = document.createElement("div");
                    labelIcon.className = "side-panel-label-icon side-panel-label-icon-close";
                    labelIconBox.appendChild(labelIcon);

                    const labelText = document.createElement("span");
                    labelText.className = "side-panel-label-text";
                    labelText.textContent = style?.title;
                    sidePanelLabel.appendChild(labelIconBox);
                    sidePanelLabel.appendChild(labelText);

                    const sidePanelExtraLabels = document.createElement("div");
                    sidePanelExtraLabels.className = "side-panel-extra-labels";


                    const minimizeIcon = document.createElement("div");
                    minimizeIcon.className = "side-panel-label-icon side-panel-label-icon-minimize ui-icon-set --arrow-line";

                    const minimizeLabelText = document.createElement("span");
                    minimizeLabelText.className = "side-panel-label-text";

                    const sidePanelLoader = document.createElement("div");
                    sidePanelLoader.className = "side-panel-loader";
                    sidePanelLoader.style.opacity = "0";
                    sidePanelLoader.style.display = "none";

                    const sidePanelLoaderContainer = document.createElement("div");
                    sidePanelLoaderContainer.className = "side-panel-loader-container";
                    sidePanelLoader.appendChild(sidePanelLoaderContainer);

                    sidePanelLabels.appendChild(sidePanelLabel);
                    sidePanelLabels.appendChild(sidePanelExtraLabels);
                    sidePanelContainer.appendChild(contentContainer);
                    sidePanelContainer.appendChild(sidePanelLabels);
                    sidePanelContainer.appendChild(sidePanelLoader);
                    sidePanelOverlay.appendChild(sidePanelContainer);

                    document.body.appendChild(sidePanelOverlay);

                    setTimeout(() => {
                        sidePanelOverlay.style.transform = "translateX(0%)";
                        sidePanelOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
                    }, 100);

                    const closeButton = labelIconBox;
                    
                    
                    


                    closeButton.onclick = () => {
                        sidePanelOverlay.style.transform = "translateX(100%)";
                        sidePanelOverlay.style.backgroundColor = "rgba(0, 0, 0, 0)";
                        setTimeout(() => {
                            sidePanelOverlay.remove();
                            document.body.style.overflow = "auto";
                        }, 300);
                    };
                } else {
                    history.replaceState(null, '', href);
                }
            }
        };
         console.log(1)
        document.body.addEventListener("click", handleClick);

        return () => {
            document.body.removeEventListener("click", handleClick);
        };
    }, []);

    return <>{children}</>;
};

export default LinkHandler;
