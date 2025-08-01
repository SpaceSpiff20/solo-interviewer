"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, transcripts, interviewData, duration, apiKeys, conversationText, reflectionPrompt, openaiResponse, openaiData, reflectionText, reflection, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (req.method !== 'POST') {
                        return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    _a = req.body, transcripts = _a.transcripts, interviewData = _a.interviewData, duration = _a.duration, apiKeys = _a.apiKeys;
                    if (!(apiKeys === null || apiKeys === void 0 ? void 0 : apiKeys.openai)) {
                        return [2 /*return*/, res.status(400).json({ error: 'OpenAI API key required' })];
                    }
                    conversationText = transcripts
                        .map(function (t) { return "".concat(t.speaker, ": ").concat(t.text); })
                        .join('\n');
                    reflectionPrompt = "Analyze this job interview and provide constructive feedback.\n\nJob Description: ".concat((interviewData === null || interviewData === void 0 ? void 0 : interviewData.jobDescription) || 'Not provided', "\nResume: ").concat((interviewData === null || interviewData === void 0 ? void 0 : interviewData.resume) || 'Not provided', "\nInterview Duration: ").concat(Math.floor(duration / 60), " minutes\n\nInterview Transcript:\n").concat(conversationText, "\n\nPlease provide:\n1. A brief overall summary (2-3 sentences) highlighting strengths and areas for improvement\n2. 3-5 specific moments with timestamps, questions asked, candidate responses, and recommendations\n\nFormat your response as JSON:\n{\n  \"summary\": \"Overall assessment...\",\n  \"feedbackMoments\": [\n    {\n      \"id\": \"1\",\n      \"timestamp\": \"2:30\",\n      \"question\": \"Question that was asked\",\n      \"userResponse\": \"How the candidate responded\",\n      \"feedback\": \"What they did well or could improve\",\n      \"recommendation\": \"Specific advice for improvement\",\n      \"type\": \"strength\" or \"improvement\"\n    }\n  ]\n}");
                    return [4 /*yield*/, fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(apiKeys.openai),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                model: 'gpt-4o',
                                messages: [
                                    { role: 'system', content: 'You are an expert job interview coach providing constructive feedback.' },
                                    { role: 'user', content: reflectionPrompt }
                                ],
                                max_tokens: 1000,
                                temperature: 0.3,
                                response_format: { type: 'json_object' }
                            }),
                        })];
                case 2:
                    openaiResponse = _d.sent();
                    if (!openaiResponse.ok) {
                        throw new Error("OpenAI API error: ".concat(openaiResponse.status));
                    }
                    return [4 /*yield*/, openaiResponse.json()];
                case 3:
                    openaiData = _d.sent();
                    reflectionText = (_c = (_b = openaiData.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
                    if (!reflectionText) {
                        throw new Error('No reflection generated');
                    }
                    reflection = JSON.parse(reflectionText);
                    res.status(200).json(reflection);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _d.sent();
                    console.error('Reflection API error:', error_1);
                    res.status(500).json({
                        error: 'Internal server error',
                        details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
module.exports = handler;
