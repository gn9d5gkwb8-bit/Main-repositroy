-- Client entry point. Runs once for each player when they join.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local Greeting = require(ReplicatedStorage.Shared.Greeting)

print(Greeting.greet(Players.LocalPlayer.DisplayName) .. " (from the client)")
