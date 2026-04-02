(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/Countdown.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "countdown": "Countdown-module__pe8l5a__countdown",
  "fadeInUp": "Countdown-module__pe8l5a__fadeInUp",
  "flipIn": "Countdown-module__pe8l5a__flipIn",
  "label": "Countdown-module__pe8l5a__label",
  "number": "Countdown-module__pe8l5a__number",
  "numberWrap": "Countdown-module__pe8l5a__numberWrap",
  "separator": "Countdown-module__pe8l5a__separator",
  "unit": "Countdown-module__pe8l5a__unit",
});
}),
"[project]/components/Countdown.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Countdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/components/Countdown.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function calculateTimeLeft(targetDate) {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor(diff / (1000 * 60 * 60) % 24),
        minutes: Math.floor(diff / (1000 * 60) % 60),
        seconds: Math.floor(diff / 1000 % 60)
    };
}
function pad(n) {
    return String(n).padStart(2, "0");
}
function Countdown({ targetDate }) {
    _s();
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Countdown.useEffect": ()=>{
            setMounted(true);
            setTimeLeft(calculateTimeLeft(targetDate));
            const timer = setInterval({
                "Countdown.useEffect.timer": ()=>{
                    setTimeLeft(calculateTimeLeft(targetDate));
                }
            }["Countdown.useEffect.timer"], 1000);
            return ({
                "Countdown.useEffect": ()=>clearInterval(timer)
            })["Countdown.useEffect"];
        }
    }["Countdown.useEffect"], [
        targetDate
    ]);
    /* ── Skeleton while JS loads (avoids hydration mismatch) */ if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].countdown,
            "aria-hidden": "true",
            children: [
                "DAYS",
                "HRS",
                "MIN",
                "SEC"
            ].map((label, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].unit,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].numberWrap,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].number,
                                children: "--"
                            }, void 0, false, {
                                fileName: "[project]/components/Countdown.tsx",
                                lineNumber: 56,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/Countdown.tsx",
                            lineNumber: 55,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                            children: label
                        }, void 0, false, {
                            fileName: "[project]/components/Countdown.tsx",
                            lineNumber: 58,
                            columnNumber: 13
                        }, this),
                        i < 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].separator,
                            children: ":"
                        }, void 0, false, {
                            fileName: "[project]/components/Countdown.tsx",
                            lineNumber: 59,
                            columnNumber: 23
                        }, this)
                    ]
                }, label, true, {
                    fileName: "[project]/components/Countdown.tsx",
                    lineNumber: 54,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/components/Countdown.tsx",
            lineNumber: 52,
            columnNumber: 7
        }, this);
    }
    const units = [
        {
            value: timeLeft.days,
            label: "DAYS"
        },
        {
            value: timeLeft.hours,
            label: "HRS"
        },
        {
            value: timeLeft.minutes,
            label: "MIN"
        },
        {
            value: timeLeft.seconds,
            label: "SEC"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].countdown,
        role: "timer",
        "aria-live": "off",
        "aria-label": `Launching in ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`,
        children: units.map(({ value, label }, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].unit,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].numberWrap,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].number,
                            children: pad(value)
                        }, `${label}-${value}`, false, {
                            fileName: "[project]/components/Countdown.tsx",
                            lineNumber: 83,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/Countdown.tsx",
                        lineNumber: 82,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/components/Countdown.tsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this),
                    i < units.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Countdown$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].separator,
                        "aria-hidden": "true",
                        children: ":"
                    }, void 0, false, {
                        fileName: "[project]/components/Countdown.tsx",
                        lineNumber: 93,
                        columnNumber: 13
                    }, this)
                ]
            }, label, true, {
                fileName: "[project]/components/Countdown.tsx",
                lineNumber: 81,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/Countdown.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(Countdown, "66fekf1hPxoJ2MX8XTkduhesu9c=");
_c = Countdown;
var _c;
__turbopack_context__.k.register(_c, "Countdown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/EmailCapture.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "button": "EmailCapture-module__rv5BnG__button",
  "checkmark": "EmailCapture-module__rv5BnG__checkmark",
  "container": "EmailCapture-module__rv5BnG__container",
  "error": "EmailCapture-module__rv5BnG__error",
  "fadeIn": "EmailCapture-module__rv5BnG__fadeIn",
  "fadeInUp": "EmailCapture-module__rv5BnG__fadeInUp",
  "form": "EmailCapture-module__rv5BnG__form",
  "heading": "EmailCapture-module__rv5BnG__heading",
  "input": "EmailCapture-module__rv5BnG__input",
  "inputWrap": "EmailCapture-module__rv5BnG__inputWrap",
  "inputWrapError": "EmailCapture-module__rv5BnG__inputWrapError",
  "spin": "EmailCapture-module__rv5BnG__spin",
  "spinner": "EmailCapture-module__rv5BnG__spinner",
  "success": "EmailCapture-module__rv5BnG__success",
  "successText": "EmailCapture-module__rv5BnG__successText",
});
}),
"[project]/components/EmailCapture.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EmailCapture
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/components/EmailCapture.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function EmailCapture() {
    _s();
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    function resetError() {
        if (status === "error") {
            setStatus("idle");
            setMessage("");
        }
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = email.trim();
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setStatus("error");
            setMessage("Enter a valid email address.");
            return;
        }
        setStatus("loading");
        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: trimmed
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setMessage(data.message ?? "You're on the list.");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error ?? "Something went wrong. Try again.");
            }
        } catch  {
            setStatus("error");
            setMessage("Connection failed. Please try again.");
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heading,
                children: "BE THE FIRST TO KNOW"
            }, void 0, false, {
                fileName: "[project]/components/EmailCapture.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            status === "success" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].success,
                role: "status",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].checkmark,
                        "aria-hidden": "true",
                        children: "✓"
                    }, void 0, false, {
                        fileName: "[project]/components/EmailCapture.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].successText,
                        children: message
                    }, void 0, false, {
                        fileName: "[project]/components/EmailCapture.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/EmailCapture.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].form,
                onSubmit: handleSubmit,
                noValidate: true,
                "aria-label": "Join the Knytra waitlist",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputWrap} ${status === "error" ? __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputWrapError : ""}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "waitlist-email",
                                type: "email",
                                name: "email",
                                value: email,
                                onChange: (e)=>{
                                    setEmail(e.target.value);
                                    resetError();
                                },
                                placeholder: "YOUR EMAIL ADDRESS",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                disabled: status === "loading",
                                "aria-label": "Your email address",
                                "aria-describedby": status === "error" ? "email-error" : undefined,
                                autoComplete: "email",
                                spellCheck: false
                            }, void 0, false, {
                                fileName: "[project]/components/EmailCapture.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                id: "join-waitlist-btn",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].button,
                                disabled: status === "loading",
                                "aria-label": "Join the waitlist",
                                children: status === "loading" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].spinner,
                                    role: "status",
                                    "aria-label": "Submitting…"
                                }, void 0, false, {
                                    fileName: "[project]/components/EmailCapture.tsx",
                                    lineNumber: 96,
                                    columnNumber: 17
                                }, this) : "NOTIFY ME"
                            }, void 0, false, {
                                fileName: "[project]/components/EmailCapture.tsx",
                                lineNumber: 88,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/EmailCapture.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this),
                    status === "error" && message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        id: "email-error",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EmailCapture$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].error,
                        role: "alert",
                        children: message
                    }, void 0, false, {
                        fileName: "[project]/components/EmailCapture.tsx",
                        lineNumber: 104,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/EmailCapture.tsx",
                lineNumber: 65,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/EmailCapture.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
_s(EmailCapture, "/eBPOidHbk738mJFZUaD7jdGrWA=");
_c = EmailCapture;
var _c;
__turbopack_context__.k.register(_c, "EmailCapture");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_06s_idj._.js.map