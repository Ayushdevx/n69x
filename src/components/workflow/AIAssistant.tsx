
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Code, 
  Zap, 
  Star, 
  MessageSquare, 
  Settings, 
  RefreshCw,
  Copy,
  Download,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  History,
  Trash2,
  Edit3,
  Share,
  Brain,
  Search,
  Filter,
  Wand2,
  Target,
  TrendingUp,
  Shield,
  Cpu
} from 'lucide-react';
import { Node } from '@xyflow/react';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantProps {
  nodes: Node[];
  selectedNode: Node | null;
  onApplyWorkflowSuggestion: (suggestion: any) => void;
  onApplyNodeOptimization: (nodeId: string, optimization: any) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'suggestion' | 'optimization' | 'analysis' | 'code' | 'error' | 'insight';
  data?: any;
  rating?: number;
  bookmarked?: boolean;
  tokens?: number;
}

interface ConversationHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  nodeCount: number;
}

const GEMINI_API_KEY = 'AIzaSyBaVbqz4lQoVba-PBNQC0mtnEvfBmZAHlI';

const ENHANCED_QUICK_ACTIONS = [
  { label: 'Optimize Performance', icon: Zap, type: 'optimize', description: 'Analyze and optimize workflow performance', color: 'bg-yellow-500' },
  { label: 'Security Analysis', icon: Shield, type: 'security', description: 'Check for security vulnerabilities', color: 'bg-red-500' },
  { label: 'Best Practices', icon: Target, type: 'best-practices', description: 'Apply industry best practices', color: 'bg-green-500' },
  { label: 'Code Generation', icon: Code, type: 'code', description: 'Generate code snippets and templates', color: 'bg-blue-500' },
  { label: 'Smart Insights', icon: Brain, type: 'insights', description: 'Get AI-powered workflow insights', color: 'bg-purple-500' },
  { label: 'Error Detection', icon: Search, type: 'analyze', description: 'Find and fix potential issues', color: 'bg-orange-500' },
];

const CONVERSATION_MODES = [
  { id: 'assistant', label: 'Assistant', icon: Bot, description: 'General workflow assistance' },
  { id: 'expert', label: 'Expert', icon: Brain, description: 'Advanced technical guidance' },
  { id: 'code', label: 'Code Gen', icon: Code, description: 'Code generation and snippets' },
  { id: 'debug', label: 'Debug', icon: Search, description: 'Debugging and troubleshooting' },
  { id: 'optimize', label: 'Optimize', icon: TrendingUp, description: 'Performance optimization' },
];

export const AIAssistant = ({ nodes, selectedNode, onApplyWorkflowSuggestion, onApplyNodeOptimization }: AIAssistantProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🚀 **Welcome to your Enhanced AI Workflow Assistant!**\n\nI\'m powered by Gemini 2.5 Flash Preview and here to supercharge your workflow automation:\n\n✨ **What I can do:**\n• 🎯 **Smart Optimization** - Performance tuning and bottleneck detection\n• 🔒 **Security Analysis** - Vulnerability scanning and fixes\n• 🧠 **Intelligent Insights** - Pattern recognition and recommendations\n• 💡 **Code Generation** - Custom templates and snippets\n• 🔧 **Debug Assistance** - Error detection and resolution\n• 📊 **Best Practices** - Industry standard implementations\n\n🎨 **Enhanced Features:**\n• Conversation history and bookmarks\n• Advanced quick actions\n• Message reactions and feedback\n• Export capabilities\n• Multi-mode assistance\n\nWhat would you like to explore today?',
      timestamp: new Date(),
      type: 'insight',
      tokens: 245
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationMode, setConversationMode] = useState<'assistant' | 'expert' | 'code' | 'debug' | 'optimize'>('assistant');
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGeminiAPI = async (prompt: string, context?: any) => {
    try {
      const enhancedSystemPrompt = `You are an elite AI workflow automation expert with deep expertise in enterprise automation, performance optimization, and security. You provide cutting-edge insights and solutions.

ENHANCED CONTEXT:
- Mode: ${conversationMode} (adjust expertise level accordingly)
- Workflow Stats: ${context?.totalNodes || 0} nodes, ${context?.nodeTypes?.join(', ') || 'none'} types
- Selected Node: ${context?.selectedNode ? `${context.selectedNode.type} (${context.selectedNode.label})` : 'none'}
- Complexity: ${context?.workflowComplexity || 'unknown'}
- Previous Context: ${messages.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 100)}`).join(' | ')}

RESPONSE GUIDELINES:
- Use emojis and formatting for better readability
- Provide actionable, specific recommendations
- Include code examples when relevant
- Be concise but comprehensive
- Focus on ${conversationMode === 'expert' ? 'advanced technical details' : conversationMode === 'code' ? 'code implementation' : 'practical solutions'}

User Query: ${prompt}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: enhancedSystemPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: conversationMode === 'code' ? 0.3 : 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3072,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error Response:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response at this time.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      tokens: inputMessage.length / 4 // Rough estimate
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    const context = {
      totalNodes: nodes.length,
      nodeTypes: [...new Set(nodes.map(n => n.type))],
      selectedNode: selectedNode ? {
        type: selectedNode.type,
        label: selectedNode.data.label,
        config: selectedNode.data.config
      } : null,
      workflowComplexity: nodes.length > 15 ? 'high' : nodes.length > 8 ? 'medium' : 'low',
      conversationMode
    };

    try {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = await callGeminiAPI(inputMessage, context);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        type: conversationMode === 'code' ? 'code' : conversationMode === 'optimize' ? 'optimization' : 'insight',
        tokens: aiResponse.length / 4
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: "🤖 AI Response Generated",
        description: "New insights available with enhanced analysis",
      });
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ I apologize, but I\'m experiencing technical difficulties. Please check your internet connection and try again.',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "AI Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (actionType: string) => {
    setIsLoading(true);
    setIsTyping(true);
    
    const context = {
      nodes: nodes.map(n => ({ 
        type: n.type, 
        label: n.data.label,
        enabled: n.data.enabled,
        config: n.data.config 
      })),
      totalNodes: nodes.length,
      nodeTypes: [...new Set(nodes.map(n => n.type))],
      selectedNode: selectedNode ? {
        type: selectedNode.type,
        label: selectedNode.data.label,
        config: selectedNode.data.config
      } : null
    };

    let prompt = '';
    let messageType: ChatMessage['type'] = 'analysis';

    switch (actionType) {
      case 'optimize':
        prompt = "🚀 **PERFORMANCE OPTIMIZATION ANALYSIS**\n\nPerform a comprehensive performance audit of my workflow. Focus on:\n• Execution speed and bottlenecks\n• Resource utilization\n• Scalability improvements\n• Memory optimization\n• Parallel processing opportunities\n\nProvide specific, actionable recommendations with implementation details.";
        messageType = 'optimization';
        break;
      case 'security':
        prompt = "🔒 **SECURITY VULNERABILITY ASSESSMENT**\n\nConduct a thorough security analysis covering:\n• Data exposure risks\n• Authentication weaknesses\n• API security\n• Input validation gaps\n• Access control issues\n\nProvide detailed remediation steps and security best practices.";
        messageType = 'analysis';
        break;
      case 'best-practices':
        prompt = "🎯 **BEST PRACTICES IMPLEMENTATION**\n\nAnalyze my workflow against industry standards:\n• Architecture patterns\n• Error handling strategies\n• Monitoring and logging\n• Documentation standards\n• Maintainability improvements\n\nSuggest specific upgrades to align with enterprise standards.";
        messageType = 'suggestion';
        break;
      case 'code':
        prompt = "💻 **ADVANCED CODE GENERATION**\n\nGenerate production-ready code including:\n• Custom node implementations\n• Error handling wrappers\n• Utility functions\n• Configuration templates\n• Testing snippets\n\nFocus on clean, maintainable, and well-documented code.";
        messageType = 'code';
        break;
      case 'insights':
        prompt = "🧠 **AI-POWERED WORKFLOW INSIGHTS**\n\nProvide intelligent analysis covering:\n• Pattern recognition in workflow design\n• Optimization opportunities\n• Potential failure points\n• Scalability predictions\n• Integration suggestions\n\nUse advanced AI capabilities to uncover hidden insights.";
        messageType = 'insight';
        break;
      case 'analyze':
        prompt = "🔍 **COMPREHENSIVE ERROR DETECTION**\n\nPerform deep analysis to identify:\n• Logic errors and edge cases\n• Configuration issues\n• Performance bottlenecks\n• Integration problems\n• Maintenance risks\n\nProvide detailed debugging guidance and prevention strategies.";
        messageType = 'analysis';
        break;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Enhanced loading experience
      const aiResponse = await callGeminiAPI(prompt, context);
      
      const actionMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        type: messageType,
        data: { actionType, context },
        tokens: aiResponse.length / 4
      };

      setMessages(prev => [...prev, actionMessage]);
    } catch (error) {
      console.error('Error in quick action:', error);
      toast({
        title: "Action Failed",
        description: "Could not complete the requested action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const rateMessage = (messageId: string, rating: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
    toast({
      title: "✅ Feedback Recorded",
      description: "Thank you for rating this response!",
    });
  };

  const toggleBookmark = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, bookmarked: !msg.bookmarked } : msg
    ));
    toast({
      title: "🔖 Bookmark Updated",
      description: "Message bookmark status changed",
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "📋 Copied to Clipboard",
      description: "Message content copied successfully",
    });
  };

  const exportConversation = () => {
    const conversationData = {
      title: `Workflow Conversation - ${new Date().toLocaleDateString()}`,
      messages: messages,
      metadata: {
        nodeCount: nodes.length,
        conversationMode,
        totalTokens: messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0)
      }
    };
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-conversation-${Date.now()}.json`;
    a.click();
    
    toast({
      title: "📥 Conversation Exported",
      description: "Conversation saved to your downloads",
    });
  };

  const saveConversation = () => {
    const conversation: ConversationHistory = {
      id: Date.now().toString(),
      title: `Workflow Session - ${new Date().toLocaleDateString()}`,
      messages: messages,
      createdAt: new Date(),
      nodeCount: nodes.length
    };
    
    setConversationHistory(prev => [...prev, conversation]);
    toast({
      title: "💾 Conversation Saved",
      description: "Added to conversation history",
    });
  };

  const clearConversation = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: '🔄 **Conversation Reset!**\n\nI\'m ready for a fresh start. How can I help optimize your workflow today?',
      timestamp: new Date(),
      type: 'insight'
    }]);
    toast({
      title: "🗑️ Conversation Cleared",
      description: "Started fresh conversation",
    });
  };

  const filteredMessages = messages.filter(msg => {
    if (filterType !== 'all' && msg.type !== filterType) return false;
    if (searchTerm && !msg.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0);
  const currentMode = CONVERSATION_MODES.find(mode => mode.id === conversationMode);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Enhanced Header */}
      <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800/80 to-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Enhanced AI Assistant
              </h3>
              <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash Preview • {totalTokens.toLocaleString()} tokens</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
              {currentMode?.label} Mode
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="hover:bg-gray-700">
              <History className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={saveConversation} className="hover:bg-gray-700">
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={exportConversation} className="hover:bg-gray-700">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearConversation} className="hover:bg-gray-700">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Enhanced Mode Selection */}
        <div className="grid grid-cols-5 gap-1 mb-4">
          {CONVERSATION_MODES.map((mode) => (
            <Button
              key={mode.id}
              variant={conversationMode === mode.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setConversationMode(mode.id as any)}
              className={`text-xs transition-all duration-200 ${
                conversationMode === mode.id 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg scale-105' 
                  : 'hover:bg-gray-700 border-gray-600'
              }`}
              title={mode.description}
            >
              <mode.icon className="w-3 h-3 mr-1" />
              {mode.label}
            </Button>
          ))}
        </div>
        
        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {ENHANCED_QUICK_ACTIONS.map((action) => (
            <Button
              key={action.type}
              onClick={() => handleQuickAction(action.type)}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="text-xs hover:bg-gray-700 border-gray-600 text-gray-300 transition-all duration-200 hover:scale-105"
              title={action.description}
            >
              <div className={`w-3 h-3 rounded mr-2 ${action.color}`}>
                <action.icon className="w-2 h-2 text-white m-0.5" />
              </div>
              {action.label}
            </Button>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex space-x-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-700 border-gray-600 text-white text-xs h-8"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white text-xs rounded px-2 h-8"
          >
            <option value="all">All</option>
            <option value="suggestion">Suggestions</option>
            <option value="code">Code</option>
            <option value="optimization">Optimizations</option>
            <option value="insight">Insights</option>
          </select>
        </div>
      </div>

      {/* Enhanced Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl p-4 backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
                  : message.type === 'error'
                  ? 'bg-gradient-to-r from-red-600/80 to-red-700/80'
                  : 'bg-gradient-to-r from-gray-700/90 to-gray-800/90 border border-gray-600/50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-xs text-gray-300">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.type && (
                      <Badge variant="outline" className="text-xs border-gray-500 bg-gray-800/50">
                        {message.type}
                      </Badge>
                    )}
                    {message.tokens && (
                      <Badge variant="outline" className="text-xs border-gray-500 bg-gray-800/50">
                        {message.tokens} tokens
                      </Badge>
                    )}
                    {message.bookmarked && (
                      <Bookmark className="w-3 h-3 text-yellow-400 fill-current" />
                    )}
                  </div>
                  
                  {/* Enhanced Message Actions */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content)}
                        className="h-6 w-6 p-0 hover:bg-gray-600"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(message.id)}
                        className="h-6 w-6 p-0 hover:bg-gray-600"
                      >
                        <Bookmark className={`w-3 h-3 ${message.bookmarked ? 'text-yellow-400 fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rateMessage(message.id, message.rating === 1 ? 0 : 1)}
                        className="h-6 w-6 p-0 hover:bg-gray-600"
                      >
                        <ThumbsUp className={`w-3 h-3 ${message.rating === 1 ? 'text-green-400 fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rateMessage(message.id, message.rating === -1 ? 0 : -1)}
                        className="h-6 w-6 p-0 hover:bg-gray-600"
                      >
                        <ThumbsDown className={`w-3 h-3 ${message.rating === -1 ? 'text-red-400 fill-current' : ''}`} />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
                
                {/* Enhanced Action Buttons */}
                {message.type === 'suggestion' && message.data && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      onClick={() => onApplyWorkflowSuggestion(message.data)}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs shadow-lg"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      Apply Suggestions
                    </Button>
                  </div>
                )}
                
                {message.type === 'optimization' && message.data && selectedNode && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      onClick={() => onApplyNodeOptimization(selectedNode.id, message.data)}
                      size="sm"
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-xs shadow-lg"
                    >
                      <Cpu className="w-3 h-3 mr-1" />
                      Apply Optimization
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Enhanced Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-gray-700/90 to-gray-800/90 rounded-xl p-4 backdrop-blur-sm shadow-lg border border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <Bot className="w-4 h-4 text-blue-400 animate-pulse" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-300">
                    {isTyping ? 'AI is analyzing and generating insights...' : 'Processing request...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Enhanced Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gradient-to-r from-gray-800/80 to-slate-800/80 backdrop-blur-sm">
        <div className="flex space-x-2 mb-2">
          <div className="flex-1 relative">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask about ${currentMode?.description?.toLowerCase()}...`}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 resize-none min-h-[60px] pr-12"
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {inputMessage.length}/2000
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[50px] h-[60px] shadow-lg"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            💡 Enter to send • Shift+Enter for new line • Rate responses to improve AI
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>🔥 {ENHANCED_QUICK_ACTIONS.length} Quick Actions</span>
            <span>•</span>
            <span>🎯 {CONVERSATION_MODES.length} Modes</span>
            <span>•</span>
            <span>📊 {messages.length} Messages</span>
          </div>
        </div>
      </div>
    </div>
  );
};
