--!strict
-- Code in src/shared is visible to both the server and the client.
local Greeting = {}

function Greeting.greet(name: string): string
	return `Hello, {name}!`
end

return Greeting
