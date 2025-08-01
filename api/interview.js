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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, transcript, conversationHistory, apiKeys, interviewData, systemPrompt, messages, openaiResponse, openaiData, interviewerResponse, speechifyResponse, speechifyStream, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (req.method !== 'POST') {
                        return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, , 6]);
                    _a = req.body, transcript = _a.transcript, conversationHistory = _a.conversationHistory, apiKeys = _a.apiKeys, interviewData = _a.interviewData;
                    if (!(apiKeys === null || apiKeys === void 0 ? void 0 : apiKeys.openai) || !(apiKeys === null || apiKeys === void 0 ? void 0 : apiKeys.speechify)) {
                        return [2 /*return*/, res.status(400).json({ error: 'Missing required API keys' })];
                    }
                    systemPrompt = "You are conducting a job interview. You have access to the candidate's resume and the job description. Ask relevant, professional questions based on this information. Keep responses concise and natural. End the interview when you feel you have gathered sufficient information.\n\nJob Description: ".concat((interviewData === null || interviewData === void 0 ? void 0 : interviewData.jobDescription) || 'Not provided', "\nResume: ").concat((interviewData === null || interviewData === void 0 ? void 0 : interviewData.resume) || 'Not provided', "\nCover Letter: ").concat((interviewData === null || interviewData === void 0 ? void 0 : interviewData.coverLetter) || 'Not provided', "\n\nGuidelines:\n- Ask 1 question at a time\n- Keep questions relevant to the job and candidate's background  \n- Vary question types (experience, situational, technical as appropriate)\n- Be professional but conversational\n- If the candidate gives a good comprehensive answer, acknowledge it briefly before the next question\n- End the interview naturally when you've covered key areas");
                    messages = __spreadArray(__spreadArray([
                        { role: 'system', content: systemPrompt }
                    ], conversationHistory, true), [
                        { role: 'user', content: transcript }
                    ], false);
                    return [4 /*yield*/, fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(apiKeys.openai),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                model: 'gpt-4o',
                                messages: messages,
                                max_tokens: 150,
                                temperature: 0.7,
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
                    interviewerResponse = (_c = (_b = openaiData.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
                    if (!interviewerResponse) {
                        throw new Error('No response from OpenAI');
                    }
                    return [4 /*yield*/, fetch('https://api.speechify.com/v1/audio/speech', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(apiKeys.speechify),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                input: interviewerResponse,
                                voice_id: 'oliver',
                                audio_format: 'mp3',
                                sample_rate: 24000,
                            }),
                        })];
                case 4:
                    speechifyResponse = _d.sent();
                    if (!speechifyResponse.ok) {
                        throw new Error("Speechify API error: ".concat(speechifyResponse.status));
                    }
                    // Set headers for audio streaming
                    res.setHeader('Content-Type', 'audio/mpeg');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.setHeader('Connection', 'keep-alive');
                    speechifyStream = speechifyResponse.body;
                    if (speechifyStream) {
                        speechifyStream.pipe(res);
                    }
                    else {
                        throw new Error('No audio stream received from Speechify');
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _d.sent();
                    console.error('Interview API error:', error_1);
                    res.status(500).json({
                        error: 'Internal server error',
                        details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                    });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
module.exports = handler;
