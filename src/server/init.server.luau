-- Server entry point. Runs once when the server starts.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local Greeting = require(ReplicatedStorage.Shared.Greeting)

Players.PlayerAdded:Connect(function(player)
	print(Greeting.greet(player.DisplayName))
end)
